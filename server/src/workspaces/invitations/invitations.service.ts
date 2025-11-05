import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { WorkspaceInvitation } from "./entities/invitation.entity";
import { WorkspaceRole } from "../entities/workspace-member.entity";
import { WorkspaceMembersService } from "../workspace-members/workspace-members.service";
import { WorkspacesService } from "../workspaces.service";
import { EmailService } from "../../common/services/email.service";
import { UsersService } from "../../users/users.service";
import * as crypto from "crypto";

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(WorkspaceInvitation)
    private invitationRepository: Repository<WorkspaceInvitation>,
    @Inject(forwardRef(() => WorkspaceMembersService))
    private workspaceMembersService: WorkspaceMembersService,
    @Inject(forwardRef(() => WorkspacesService))
    private workspacesService: WorkspacesService,
    private emailService: EmailService,
    private usersService: UsersService,
    private configService: ConfigService
  ) {}

  /**
   * Create a new invitation
   */
  async createInvitation(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
    invitedBy: string
  ): Promise<WorkspaceInvitation> {
    // Check if user is already a member
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      const existingMember = await this.workspaceMembersService.findMember(
        workspaceId,
        existingUser.id
      );
      if (existingMember) {
        throw new BadRequestException("User đã là member của workspace này");
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await this.invitationRepository
      .createQueryBuilder("invitation")
      .where("invitation.workspaceId = :workspaceId", { workspaceId })
      .andWhere("invitation.email = :email", { email })
      .andWhere("invitation.acceptedAt IS NULL")
      .andWhere("invitation.rejectedAt IS NULL")
      .getOne();

    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      throw new BadRequestException("Đã có invitation đang pending cho email này");
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = this.invitationRepository.create({
      workspaceId,
      email,
      role,
      token,
      invitedBy,
      expiresAt,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Send invitation email
    const inviter = await this.usersService.findOne(invitedBy);
    const workspace = await this.workspaceMembersService["memberRepository"]
      .manager.getRepository("workspaces")
      .findOne({ where: { id: workspaceId } });

    if (inviter && workspace) {
      await this.emailService.sendInvitationEmail(
        email,
        workspace.name || "Workspace",
        inviter.username || inviter.email,
        token
      );
    }

    return savedInvitation;
  }

  /**
   * Get all invitations for a workspace
   */
  async findAll(workspaceId: string): Promise<WorkspaceInvitation[]> {
    return this.invitationRepository.find({
      where: { workspaceId },
      relations: ["inviter"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Find invitation by token
   */
  async findByToken(token: string): Promise<WorkspaceInvitation | null> {
    return this.invitationRepository.findOne({
      where: { token },
      relations: ["workspace", "inviter"],
    });
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.findByToken(token);

    if (!invitation) {
      throw new NotFoundException("Invitation không tìm thấy");
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException("Invitation đã hết hạn");
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException("Invitation đã được accept");
    }

    if (invitation.rejectedAt) {
      throw new BadRequestException("Invitation đã bị reject");
    }

    // Verify email matches
    const user = await this.usersService.findOne(userId);
    if (!user || user.email !== invitation.email) {
      throw new ForbiddenException("Email không khớp với invitation");
    }

    // Add user to workspace
    await this.workspaceMembersService.addMember(
      invitation.workspaceId,
      userId,
      invitation.role
    );

    // Mark invitation as accepted
    await this.invitationRepository.update(invitation.id, {
      acceptedAt: new Date(),
    });
  }

  /**
   * Reject invitation
   */
  async rejectInvitation(token: string): Promise<void> {
    const invitation = await this.findByToken(token);

    if (!invitation) {
      throw new NotFoundException("Invitation không tìm thấy");
    }

    if (invitation.acceptedAt) {
      throw new BadRequestException("Invitation đã được accept");
    }

    if (invitation.rejectedAt) {
      // Already rejected
      return;
    }

    await this.invitationRepository.update(invitation.id, {
      rejectedAt: new Date(),
    });
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException("Invitation không tìm thấy");
    }

    // Check if user has permission to cancel (must be inviter or workspace admin/owner)
    if (invitation.invitedBy !== userId) {
      // Could add additional permission check here
      throw new ForbiddenException("Bạn không có quyền cancel invitation này");
    }

    if (invitation.acceptedAt || invitation.rejectedAt) {
      throw new BadRequestException("Invitation đã được accept hoặc reject");
    }

    await this.invitationRepository.delete(invitationId);
  }
}

