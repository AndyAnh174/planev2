import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import * as helmet from "helmet";
import compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet.default());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("Notion Clone API")
    .setDescription("API documentation cho hệ thống Notion/Kanban Clone")
    .setVersion("1.0")
    .addTag("auth", "Xác thực và đăng nhập")
    .addTag("users", "Quản lý người dùng")
    .addTag("workspaces", "Quản lý workspace")
    .addTag("pages", "Quản lý pages và blocks")
    .addTag("boards", "Quản lý Kanban boards và cards")
    .addTag("comments", "Quản lý comments")
    .addTag("files", "Upload và quản lý files")
    .addTag("ai", "AI integration (summarize, brainstorm, translate)")
    .addTag("search", "Full-text và semantic search")
    .addTag("realtime", "Realtime collaboration")
    .addTag("health", "Health check endpoints")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI available at: http://localhost:${port}/api`);
}
bootstrap();
