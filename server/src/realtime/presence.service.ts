import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PresenceService {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const redisConfig = this.configService.get("redis") || {};
    const redisUrl = redisConfig.url || process.env.REDIS_URL;
    
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    } else {
      this.redis = new Redis({
        host: redisConfig.host || process.env.REDIS_HOST || "localhost",
        port: redisConfig.port || parseInt(process.env.REDIS_PORT || "6379", 10),
      });
    }
  }

  async addUserToPage(userId: string, pageId: string) {
    const key = `presence:page:${pageId}`;
    await this.redis.sadd(key, userId);
    await this.redis.expire(key, 3600); // 1 hour TTL
  }

  async removeUserFromPage(userId: string, pageId: string) {
    const key = `presence:page:${pageId}`;
    await this.redis.srem(key, userId);
  }

  async getUsersOnPage(pageId: string): Promise<string[]> {
    const key = `presence:page:${pageId}`;
    return this.redis.smembers(key);
  }

  async removeUser(userId: string) {
    // Remove user from all pages
    const keys = await this.redis.keys(`presence:page:*`);
    for (const key of keys) {
      await this.redis.srem(key, userId);
    }
  }
}

