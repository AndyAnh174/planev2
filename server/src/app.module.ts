import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { PagesModule } from "./pages/pages.module";
import { BoardsModule } from "./boards/boards.module";
import { CommentsModule } from "./comments/comments.module";
import { AIModule } from "./ai/ai.module";
import { FilesModule } from "./files/files.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { SearchModule } from "./search/search.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    PagesModule,
    BoardsModule,
    CommentsModule,
    AIModule,
    FilesModule,
    RealtimeModule,
    SearchModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
