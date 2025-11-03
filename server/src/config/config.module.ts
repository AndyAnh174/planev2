import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import databaseConfig from "./database.config";
import redisConfig from "./redis.config";
import minioConfig from "./minio.config";
import aiConfig from "./ai.config";

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      load: [databaseConfig, redisConfig, minioConfig, aiConfig],
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}

