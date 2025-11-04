import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { RealtimeGateway } from "./realtime.gateway";
import { PresenceService } from "./presence.service";
import { BlockUpdateQueueService } from "./block-update-queue.service";
import { PagesModule } from "../pages/pages.module";

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    forwardRef(() => PagesModule),
  ],
  providers: [RealtimeGateway, PresenceService, BlockUpdateQueueService],
  exports: [RealtimeGateway, PresenceService, BlockUpdateQueueService],
})
export class RealtimeModule {}

