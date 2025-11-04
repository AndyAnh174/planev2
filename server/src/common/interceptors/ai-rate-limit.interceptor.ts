import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";
import { AI_RATE_LIMIT_KEY, AIRateLimitOptions } from "../decorators/ai-rate-limit.decorator";

@Injectable()
export class AIRateLimitInterceptor implements NestInterceptor {
  private redis: Redis;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector
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

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    // Check if AI rate limit decorator is present (optional override)
    const aiRateLimitOptions = this.reflector.getAllAndOverride<AIRateLimitOptions>(
      AI_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Check if this is an AI endpoint by checking the controller class name
    const handler = context.getHandler();
    const controller = context.getClass();
    const isAIController = controller.name === "AIController" || 
                           controller.name.includes("AI");
    
    // Apply rate limiting if it's an AI controller or has the decorator
    if (!isAIController && !aiRateLimitOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Get user ID (must be authenticated for AI endpoints)
    const userId = request.user?.userId || request.user?.sub;
    if (!userId) {
      throw new HttpException(
        "Unauthorized - AI endpoints require authentication",
        HttpStatus.UNAUTHORIZED
      );
    }

    // Get AI provider from config
    const provider = this.configService.get<string>("ai.provider") || "ollama";
    
    // Get rate limit config based on provider
    let maxRequests: number;
    let windowMs: number;

    if (aiRateLimitOptions.maxRequests && aiRateLimitOptions.windowMs) {
      // Use custom limits from decorator
      maxRequests = aiRateLimitOptions.maxRequests;
      windowMs = aiRateLimitOptions.windowMs / 1000; // Convert to seconds
    } else {
      // Use provider-specific defaults
      if (provider === "gemini") {
        maxRequests = parseInt(
          this.configService.get<string>("AI_RATE_LIMIT_GEMINI_MAX_REQUESTS") || "15",
          10
        );
        windowMs =
          parseInt(
            this.configService.get<string>("AI_RATE_LIMIT_GEMINI_WINDOW_MS") || "60000",
            10
          ) / 1000;
      } else {
        // Default to Ollama
        maxRequests = parseInt(
          this.configService.get<string>("AI_RATE_LIMIT_OLLAMA_MAX_REQUESTS") || "10",
          10
        );
        windowMs =
          parseInt(
            this.configService.get<string>("AI_RATE_LIMIT_OLLAMA_WINDOW_MS") || "60000",
            10
          ) / 1000;
      }
    }

    // Create rate limit key: ai-rate-limit:{provider}:{userId}
    const key = `ai-rate-limit:${provider}:${userId}`;

    // Increment counter
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, windowMs);
    }

    // Get remaining time until reset
    const ttl = await this.redis.ttl(key);
    const resetTime = Math.floor(Date.now() / 1000) + ttl;

    // Calculate remaining requests
    const remaining = Math.max(0, maxRequests - count);

    // Add rate limit headers
    response.setHeader("X-AI-RateLimit-Limit", maxRequests.toString());
    response.setHeader("X-AI-RateLimit-Remaining", remaining.toString());
    response.setHeader("X-AI-RateLimit-Reset", resetTime.toString());
    response.setHeader("X-AI-RateLimit-Provider", provider);

    // Check if rate limit exceeded
    if (count > maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Quá nhiều requests đến AI service (${provider}). Vui lòng thử lại sau.`,
          retryAfter: ttl,
          provider,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return next.handle();
  }
}

