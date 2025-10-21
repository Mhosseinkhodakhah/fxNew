import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisServiceService } from "../redis-service/redis-service.service";

export interface LockOptions {
  ttl?: number; // Time to live in milliseconds
}

@Injectable()
export class LockerService {
  private readonly logger = new Logger(LockerService.name);
  private redisClient: Redis;

  constructor(
    private redisService: RedisServiceService,
  ) {
    this.redisClient = this.redisService.getRedisClient();
  }

  /**
   * Execute a function with distributed lock protection using Redis SET NX
   * @param lockKey - Unique key for the lock
   * @param fn - Function to execute under lock
   * @param options - Lock configuration options
   * @returns Promise with the function result
   */
  async withLock<T>(
    lockKey: string,
    fn: () => Promise<T>,
    options: LockOptions = {}
  ): Promise<T> {
    const { ttl = 10000 } = options;
    const fullLockKey = `lock:${lockKey}`;
    const lockValue = Math.random().toString(36);

    try {
      // Try to acquire lock using SET NX PX
      const acquired = await this.redisClient.set(fullLockKey, lockValue, 'PX', ttl, 'NX');
      
      if (!acquired) {
        throw new Error('Lock already exists - resource is currently busy');
      }

      try {
        const result = await fn();
        return result;
      } finally {
        // Release lock only if we own it (atomic operation)
        const releaseScript = `
          if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
          else
            return 0
          end
        `;
        await this.redisClient.eval(releaseScript, 1, fullLockKey, lockValue);
      }
    } catch (error) {
      
      if (error.message?.includes('Lock already exists')) {
        throw new BadRequestException(`پردازش با همین عنوان در حال انجام است. لطفا بعدا تلاش کنید.`);
      }
      
      throw new Error(`Unable to acquire lock for resource: ${lockKey}. Error: ${error.message}`);
    }
  }

  
  async withDatabaseLock<T>(
    key: string,
    operation: () => Promise<T>,
    options: LockOptions = {}
  ): Promise<T> {
    return this.withLock(`db:${key}`, operation, options);
  }

  async withCartLock<T>(
    userId: string,
    operation: () => Promise<T>,
    options: LockOptions = {}
  ): Promise<T> {
    return this.withLock(`cart:${userId}`, operation, options);
  }
}
