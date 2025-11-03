import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
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

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId || request.user?.sub || request.ip;
    const key = `rate-limit:${userId}`;

    const windowMs =
      parseInt(
        this.configService.get<string>("RATE_LIMIT_WINDOW_MS") || "60000",
        10
      ) / 1000;
    const maxRequests = parseInt(
      this.configService.get<string>("RATE_LIMIT_MAX_REQUESTS") || "60",
      10
    );

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, windowMs);
    }

    if (count > maxRequests) {
      throw new HttpException(
        "Quá nhiều requests. Vui lòng thử lại sau.",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return next.handle();
  }
}

