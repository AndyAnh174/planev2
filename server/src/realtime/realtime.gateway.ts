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
import { PresenceService } from "./presence.service";

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

  constructor(
    private jwtService: JwtService,
    private presenceService: PresenceService
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
      await this.presenceService.removeUser(client.data.user.userId || client.data.user.sub);
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
    // Broadcast to all users in the page room (except sender)
    client.to(`page:${data.pageId}`).emit("block:updated", data.block);
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

