import { Injectable, Inject, forwardRef } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";

export interface UserPresence {
  userId: string;
  username: string;
  avatarUrl?: string;
  email: string;
  isTyping?: boolean;
  lastTypingAt?: number;
}

@Injectable()
export class PresenceService {
  private redis: Redis;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService
  ) {
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

  async addUserToPage(userId: string, pageId: string): Promise<UserPresence | null> {
    const key = `presence:page:${pageId}`;
    await this.redis.sadd(key, userId);
    await this.redis.expire(key, 3600); // 1 hour TTL

    // Get user data
    const user = await this.usersService.findOne(userId);
    if (!user) {
      return null;
    }

    // Store user presence data
    const presenceKey = `presence:user:${userId}:page:${pageId}`;
    const presence: UserPresence = {
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      email: user.email,
      isTyping: false,
    };
    await this.redis.setex(presenceKey, 3600, JSON.stringify(presence));

    return presence;
  }

  async removeUserFromPage(userId: string, pageId: string) {
    const key = `presence:page:${pageId}`;
    await this.redis.srem(key, userId);
    
    const presenceKey = `presence:user:${userId}:page:${pageId}`;
    await this.redis.del(presenceKey);
  }

  async getUsersOnPage(pageId: string): Promise<UserPresence[]> {
    const key = `presence:page:${pageId}`;
    const userIds = await this.redis.smembers(key);
    
    const presences: UserPresence[] = [];
    for (const userId of userIds) {
      const presenceKey = `presence:user:${userId}:page:${pageId}`;
      const presenceData = await this.redis.get(presenceKey);
      if (presenceData) {
        presences.push(JSON.parse(presenceData));
      } else {
        // Fallback: fetch user data if not in cache
        const user = await this.usersService.findOne(userId);
        if (user) {
          const presence: UserPresence = {
            userId: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            email: user.email,
            isTyping: false,
          };
          presences.push(presence);
        }
      }
    }
    
    return presences;
  }

  async setUserTyping(userId: string, pageId: string, isTyping: boolean) {
    const presenceKey = `presence:user:${userId}:page:${pageId}`;
    const presenceData = await this.redis.get(presenceKey);
    
    if (presenceData) {
      const presence: UserPresence = JSON.parse(presenceData);
      presence.isTyping = isTyping;
      presence.lastTypingAt = isTyping ? Date.now() : undefined;
      await this.redis.setex(presenceKey, 3600, JSON.stringify(presence));
    }
  }

  async removeUser(userId: string) {
    // Remove user from all pages
    const keys = await this.redis.keys(`presence:page:*`);
    for (const key of keys) {
      await this.redis.srem(key, userId);
    }
    
    // Remove all user presence data
    const presenceKeys = await this.redis.keys(`presence:user:${userId}:page:*`);
    for (const presenceKey of presenceKeys) {
      await this.redis.del(presenceKey);
    }
  }
}

