import { SetMetadata } from "@nestjs/common";

export const AI_RATE_LIMIT_KEY = "aiRateLimit";

export interface AIRateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

export const AIRateLimit = (options?: AIRateLimitOptions) =>
  SetMetadata(AI_RATE_LIMIT_KEY, options || {});

