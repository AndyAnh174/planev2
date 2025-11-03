import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import databaseConfig from "../config/database.config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...databaseConfig(),
        extra: {
          max: 20,
          min: 5,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
  constructor() {
    // Enable pgvector extension on module init
    // This should be done via migration in production
  }
}

