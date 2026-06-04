// redis/redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';


@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService : ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('redis.host')!!,
      port: +this.configService.get<number | string>('redis.port')!!,
      password: this.configService.get<string>('redis.password'),
      db : +this.configService.get<string|number>('redis.db')!!,
      username : this.configService.get<string>('redis.username')!!
    });
  }
  
  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async setJson(key: string, value: any, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }
}
