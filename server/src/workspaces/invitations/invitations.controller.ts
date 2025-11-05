import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { InvitationsService } from "./invitations.service";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Public } from "../../auth/decorators/public.decorator";

@ApiTags("workspaces")
@ApiBearerAuth("JWT-auth")
@Controller("workspaces/:workspaceId/invitations")
@UseGuards(AuthGuard("jwt"))
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post()
  @ApiOperation({ summary: "Tạo invitation mới" })
  @ApiParam({ name: "workspaceId", type: String })
  @ApiResponse({ status: 201, description: "Invitation đã được tạo và email đã được gửi" })
  @ApiResponse({ status: 400, description: "Email đã là member hoặc đã có invitation pending" })
  async createInvitation(
    @Param("workspaceId") workspaceId: string,
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: any
  ) {
    const userId = user.userId || user.sub;
    return this.invitationsService.createInvitation(
      workspaceId,
      createInvitationDto.email,
      createInvitationDto.role,
      userId
    );
  }

  @Get()
  @ApiOperation({ summary: "Lấy danh sách invitations của workspace" })
  @ApiParam({ name: "workspaceId", type: String })
  @ApiResponse({ status: 200, description: "Danh sách invitations" })
  async findAll(@Param("workspaceId") workspaceId: string) {
    return this.invitationsService.findAll(workspaceId);
  }

  @Get(":token")
  @ApiOperation({ summary: "Get invitation details by token" })
  @ApiParam({ name: "workspaceId", type: String })
  @ApiParam({ name: "token", type: String })
  @ApiResponse({ status: 200, description: "Invitation details" })
  @ApiResponse({ status: 404, description: "Invitation không tìm thấy" })
  async getInvitationByToken(
    @Param("workspaceId") workspaceId: string,
    @Param("token") token: string
  ) {
    const invitation = await this.invitationsService.findByToken(token);
    if (!invitation) {
      throw new NotFoundException("Invitation không tìm thấy");
    }
    if (invitation.workspaceId !== workspaceId) {
      throw new NotFoundException("Invitation không thuộc về workspace này");
    }
    return invitation;
  }

  @Post(":token/accept")
  @ApiOperation({ summary: "Accept invitation" })
  @ApiParam({ name: "workspaceId", type: String })
  @ApiParam({ name: "token", type: String })
  @ApiResponse({ status: 200, description: "Invitation đã được accept" })
  @ApiResponse({ status: 400, description: "Invitation không hợp lệ hoặc đã hết hạn" })
  async acceptInvitation(
    @Param("token") token: string,
    @CurrentUser() user: any
  ) {
    const userId = user.userId || user.sub;
    await this.invitationsService.acceptInvitation(token, userId);
    return { message: "Invitation đã được accept thành công" };
  }

  @Post(":token/reject")
  @ApiOperation({ summary: "Reject invitation" })
  @ApiParam({ name: "workspaceId", type: String })
  @ApiParam({ name: "token", type: String })
  @ApiResponse({ status: 200, description: "Invitation đã được reject" })
  @ApiResponse({ status: 404, description: "Invitation không tìm thấy" })
  async rejectInvitation(@Param("token") token: string) {
    await this.invitationsService.rejectInvitation(token);
    return { message: "Invitation đã được reject" };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Cancel invitation" })
  @ApiParam({ name: "workspaceId", type: String })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({ status: 200, description: "Invitation đã được cancel" })
  @ApiResponse({ status: 404, description: "Invitation không tìm thấy" })
  async cancelInvitation(
    @Param("id") id: string,
    @CurrentUser() user: any
  ) {
    const userId = user.userId || user.sub;
    await this.invitationsService.cancelInvitation(id, userId);
    return { message: "Invitation đã được cancel" };
  }
}

// Public controller for getting invitation by token and accepting/rejecting (no workspaceId needed)
@Controller("invitations")
@ApiTags("workspaces")
export class PublicInvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Get(":token")
  @Public()
  @ApiOperation({ summary: "Get invitation details by token (public)" })
  @ApiParam({ name: "token", type: String })
  @ApiResponse({ status: 200, description: "Invitation details" })
  @ApiResponse({ status: 404, description: "Invitation không tìm thấy" })
  async getInvitationByToken(@Param("token") token: string) {
    const invitation = await this.invitationsService.findByToken(token);
    if (!invitation) {
      throw new NotFoundException("Invitation không tìm thấy");
    }
    return invitation;
  }

  @Post(":token/accept")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Accept invitation by token (public endpoint)" })
  @ApiParam({ name: "token", type: String })
  @ApiResponse({ status: 200, description: "Invitation đã được accept" })
  @ApiResponse({ status: 400, description: "Invitation không hợp lệ hoặc đã hết hạn" })
  async acceptInvitation(
    @Param("token") token: string,
    @CurrentUser() user: any
  ) {
    const userId = user.userId || user.sub;
    await this.invitationsService.acceptInvitation(token, userId);
    return { message: "Invitation đã được accept thành công" };
  }

  @Post(":token/reject")
  @Public()
  @ApiOperation({ summary: "Reject invitation by token (public endpoint)" })
  @ApiParam({ name: "token", type: String })
  @ApiResponse({ status: 200, description: "Invitation đã được reject" })
  @ApiResponse({ status: 404, description: "Invitation không tìm thấy" })
  async rejectInvitation(@Param("token") token: string) {
    await this.invitationsService.rejectInvitation(token);
    return { message: "Invitation đã được reject" };
  }
}
