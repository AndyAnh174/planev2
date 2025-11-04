import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import Redis from "ioredis";

@Injectable()
export class GeminiService {
  private apiKey: string;
  private model: string;
  private baseURL: string;
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const aiConfig = this.configService.get("ai");
    this.apiKey = aiConfig.gemini.apiKey;
    this.model = aiConfig.gemini.model;
    this.baseURL = "https://generativelanguage.googleapis.com/v1beta";

    // Initialize Redis for cost tracking
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

  async generate(prompt: string, userId?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured");
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          timeout: 60000,
        }
      );

      const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Track API usage and costs
      if (userId) {
        await this.trackUsage(userId, response.data);
      }

      return result;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error("Failed to generate response from Gemini");
    }
  }

  private async trackUsage(userId: string, responseData: any): Promise<void> {
    try {
      // Extract usage metadata from Gemini response (if available)
      const usageMetadata = responseData.usageMetadata || {};
      const inputTokens = usageMetadata.promptTokenCount || 0;
      const outputTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || (inputTokens + outputTokens);

      // Store usage data in Redis
      const usageKey = `gemini-usage:${userId}`;
      const usageData = {
        timestamp: Date.now(),
        model: this.model,
        inputTokens,
        outputTokens,
        totalTokens,
        // Estimate cost (rough estimates based on Gemini pricing)
        // Note: Actual pricing may vary, update these values based on current pricing
        estimatedCost: this.estimateCost(inputTokens, outputTokens),
      };

      // Store latest usage
      await this.redis.setex(
        `${usageKey}:latest`,
        86400, // 24 hours
        JSON.stringify(usageData)
      );

      // Increment daily usage counter
      const today = new Date().toISOString().split("T")[0];
      const dailyKey = `gemini-usage:${userId}:${today}`;
      await this.redis.incr(dailyKey);
      await this.redis.expire(dailyKey, 86400 * 7); // Keep for 7 days

      // Log usage for monitoring
      console.log(`Gemini API usage - User: ${userId}, Tokens: ${totalTokens}, Cost: $${usageData.estimatedCost.toFixed(6)}`);
    } catch (error) {
      // Don't fail the request if tracking fails
      console.error("Failed to track Gemini usage:", error);
    }
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    // Gemini pricing estimates (as of 2024, update based on current pricing)
    // Gemini 2.0 Flash: ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
    const inputCostPerMillion = 0.075;
    const outputCostPerMillion = 0.30;

    const inputCost = (inputTokens / 1_000_000) * inputCostPerMillion;
    const outputCost = (outputTokens / 1_000_000) * outputCostPerMillion;

    return inputCost + outputCost;
  }

  async getUsageStats(userId: string, date?: string): Promise<any> {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const dailyKey = `gemini-usage:${userId}:${targetDate}`;
      const latestKey = `gemini-usage:${userId}:latest`;

      const [dailyCount, latestUsage] = await Promise.all([
        this.redis.get(dailyKey),
        this.redis.get(latestKey),
      ]);

      return {
        date: targetDate,
        dailyRequestCount: dailyCount ? parseInt(dailyCount, 10) : 0,
        latestUsage: latestUsage ? JSON.parse(latestUsage) : null,
      };
    } catch (error) {
      console.error("Failed to get Gemini usage stats:", error);
      return null;
    }
  }
}

