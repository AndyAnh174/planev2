import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";
import * as MinIO from "minio";

@Injectable()
export class HealthService {
  private redis: Redis;
  private minioClient: MinIO.Client;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService
  ) {
    // Initialize Redis
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

    // Initialize MinIO
    const minioConfig = this.configService.get("minio");
    const endpoint = minioConfig.endpoint;
    const url = new URL(endpoint);
    this.minioClient = new MinIO.Client({
      endPoint: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 9000,
      useSSL: false, // Disabled - using Cloudflare Zero Trust
      accessKey: minioConfig.accessKey,
      secretKey: minioConfig.secretKey,
    });
  }

  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  async ready() {
    const checks = {
      database: false,
      redis: false,
      minio: false,
    };

    try {
      // Check database
      await this.dataSource.query("SELECT 1");
      checks.database = true;
    } catch (error) {
      console.error("Database health check failed:", error);
    }

    try {
      // Check Redis
      await this.redis.ping();
      checks.redis = true;
    } catch (error) {
      console.error("Redis health check failed:", error);
    }

    try {
      // Check MinIO
      const bucket = this.configService.get<string>("minio.bucket");
      if (bucket) {
        await this.minioClient.bucketExists(bucket);
        checks.minio = true;
      }
    } catch (error) {
      console.error("MinIO health check failed:", error);
    }

    const isReady = Object.values(checks).every((check) => check === true);

    return {
      status: isReady ? "ready" : "not ready",
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}

