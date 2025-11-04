import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { Inject, forwardRef, Logger } from "@nestjs/common";
import { PresenceService } from "./presence.service";
import { BlockUpdateQueueService } from "./block-update-queue.service";
import { PagesService } from "../pages/pages.service";
import { WorkspaceRole } from "../workspaces/entities/workspace-member.entity";

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/realtime",
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private jwtService: JwtService,
    private presenceService: PresenceService,
    private blockUpdateQueueService: BlockUpdateQueueService,
    @Inject(forwardRef(() => PagesService))
    private pagesService: PagesService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace("Bearer ", "");
      if (token) {
        const payload = this.jwtService.verify(token);
        client.data.user = payload;
      }
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.user) {
      const userId = client.data.user.userId || client.data.user.sub;
      await this.presenceService.removeUser(userId);
      
      // Flush any pending block updates for this user
      try {
        await this.blockUpdateQueueService.flushUser(userId);
        this.logger.debug(`Flushed pending updates for user ${userId} on disconnect`);
      } catch (error) {
        this.logger.error(
          `Failed to flush pending updates for user ${userId}:`,
          error.stack || error.message
        );
      }
    }
  }

  @SubscribeMessage("page:join")
  async handleJoinPage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pageId: string }
  ) {
    if (!client.data.user) return;

    const userId = client.data.user.userId || client.data.user.sub;
    await client.join(`page:${data.pageId}`);
    await this.presenceService.addUserToPage(userId, data.pageId);

    const users = await this.presenceService.getUsersOnPage(data.pageId);
    this.server.to(`page:${data.pageId}`).emit("user:joined", {
      userId,
      users,
    });
  }

  @SubscribeMessage("page:leave")
  async handleLeavePage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pageId: string }
  ) {
    if (!client.data.user) return;

    const userId = client.data.user.userId || client.data.user.sub;
    await client.leave(`page:${data.pageId}`);
    await this.presenceService.removeUserFromPage(userId, data.pageId);

    this.server.to(`page:${data.pageId}`).emit("user:left", {
      userId,
    });
  }

  @SubscribeMessage("block:update")
  async handleBlockUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pageId: string; block: any }
  ) {
    // Check authentication
    if (!client.data.user) {
      client.emit("error", { message: "Unauthorized" });
      return;
    }

    const userId = client.data.user.userId || client.data.user.sub;

    try {
      // Validate input data
      if (!data.pageId || !data.block || !data.block.id) {
        client.emit("error", {
          message: "Invalid block update data: pageId and block.id are required",
        });
        return;
      }

      // Check user permission to edit the page
      const hasPermission = await this.pagesService.checkUserPermission(
        data.pageId,
        userId,
        "member" // Require at least member role to edit
      );

      if (!hasPermission) {
        client.emit("error", {
          message: "Permission denied: You don't have edit access to this page",
        });
        return;
      }

      // Extract block data for saving
      const blockData: Partial<any> = {
        content: data.block.content,
      };

      // Include optional fields if present
      if (data.block.type !== undefined) blockData.type = data.block.type;
      if (data.block.orderIndex !== undefined)
        blockData.orderIndex = data.block.orderIndex;
      if (data.block.parentId !== undefined)
        blockData.parentId = data.block.parentId;

      // Queue the update for debounced saving
      this.blockUpdateQueueService.queueUpdate(
        data.block.id,
        blockData,
        userId,
        data.pageId
      );

      // Broadcast to all users in the page room (except sender) for real-time UI updates
      client.to(`page:${data.pageId}`).emit("block:updated", data.block);

      this.logger.debug(
        `Queued block update: block ${data.block.id} on page ${data.pageId} by user ${userId}`
      );
    } catch (error) {
      this.logger.error(
        `Error handling block update:`,
        error.stack || error.message
      );
      client.emit("error", {
        message: "Failed to process block update",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("cursor:move")
  async handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pageId: string; position: { x: number; y: number } }
  ) {
    if (!client.data.user) return;

    const userId = client.data.user.userId || client.data.user.sub;
    client.to(`page:${data.pageId}`).emit("cursor:moved", {
      userId,
      position: data.position,
    });
  }
}

