import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { WorkspaceMembersService } from "../workspace-members/workspace-members.service";
import { WorkspaceRole } from "../entities/workspace-member.entity";

export const WORKSPACE_ROLES_KEY = "workspace-roles";

export const RequireWorkspaceRole = (...roles: WorkspaceRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);

@Injectable()
export class WorkspacePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private workspaceMembersService: WorkspaceMembersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId =
      request.params.workspaceId || request.query.workspaceId;

    if (!workspaceId) {
      throw new ForbiddenException("Workspace ID is required");
    }

    const member = await this.workspaceMembersService.findMember(
      workspaceId,
      user.userId || user.sub
    );

    if (!member) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    const roleHierarchy: Record<WorkspaceRole, number> = {
      viewer: 1,
      member: 2,
      admin: 3,
      owner: 4,
    };

    const userRoleLevel = roleHierarchy[member.role];
    const requiredRoleLevel = Math.min(
      ...requiredRoles.map((role) => roleHierarchy[role])
    );

    if (userRoleLevel < requiredRoleLevel) {
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(" or ")}, but you have: ${member.role}`
      );
    }

    return true;
  }
}

