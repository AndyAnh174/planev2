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
import { SKIP_RATE_LIMIT_KEY } from "../decorators/skip-rate-limit.decorator";

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
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
    // Check if rate limiting should be skipped
    const skipRateLimit = this.reflector.getAllAndOverride<boolean>(
      SKIP_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (skipRateLimit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Determine if user is authenticated
    const isAuthenticated = !!request.user;
    const userId = request.user?.userId || request.user?.sub || request.ip;
    const key = `rate-limit:${userId}`;

    // Get window size in seconds
    const windowMs =
      parseInt(
        this.configService.get<string>("RATE_LIMIT_WINDOW_MS") || "60000",
        10
      ) / 1000;

    // Get max requests based on authentication status
    const maxRequests = isAuthenticated
      ? parseInt(
          this.configService.get<string>("RATE_LIMIT_AUTHENTICATED_MAX_REQUESTS") ||
            "100",
          10
        )
      : parseInt(
          this.configService.get<string>("RATE_LIMIT_PUBLIC_MAX_REQUESTS") || "30",
          10
        );

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
    response.setHeader("X-RateLimit-Limit", maxRequests.toString());
    response.setHeader("X-RateLimit-Remaining", remaining.toString());
    response.setHeader("X-RateLimit-Reset", resetTime.toString());

    // Check if rate limit exceeded
    if (count > maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: "Quá nhiều requests. Vui lòng thử lại sau.",
          retryAfter: ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return next.handle();
  }
}

