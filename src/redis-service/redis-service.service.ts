import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';


@Injectable()
export class RedisServiceService {
    private readonly logger = new Logger(RedisServiceService.name);
    private redisClient: Redis;

    constructor() {
        this.initializeRedis();
    }

    private async initializeRedis() {
        try {
            // Create a dedicated Redis client for locking using the shared config
            this.redisClient = new Redis(process.env.REDIS_URL!, {
                maxRetriesPerRequest: 3,
                enableReadyCheck: true,
                lazyConnect: false,
                keyPrefix: 'userService:',
            });

            // Wait for connection and test commands
            await this.redisClient.ping();

            this.logger.log('✅ Redis service initialized successfully');

        } catch (error) {
            this.logger.error('❌ Failed to initialize Redis service:', error);
            throw error;
        }
    }

    /**
     * Get the Redis client instance for direct operations
     */
    getRedisClient(): Redis {
        return this.redisClient;
    }

    async get(key: string): Promise<any> {
        const data = await this.redisClient.get(key);
        
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                // If parsing fails, return the raw string
                return data;
            }
        }
        
        return data;
    }

    async set(key: string, value: any): Promise<any> {
        await this.redisClient.set(key, JSON.stringify(value));
    }

    async lockOtp(value : string){
        await this.redisClient.set(`otp:::lock:::${value}`, JSON.stringify(value) , 'PX' , 1000*30);
    }

    async reset(key: string) {
        await this.redisClient.del(key);
    }

    async setOtp(key: string, value: any): Promise<any> {
        
        await this.redisClient.setex(key, 120, JSON.stringify(value));
    }

    
}
