import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
  type: "postgres" as const,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "notion",
  // Disable synchronize in production - use migrations instead
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  migrations: [__dirname + "/../database/migrations/*{.ts,.js}"],
  migrationsRun: process.env.NODE_ENV === "production", // Auto-run migrations in production
  extra: {
    max: 20,
    min: 5,
  },
}));

