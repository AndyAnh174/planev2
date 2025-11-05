import { IsEmail, IsNotEmpty, IsEnum } from "class-validator";
import type { WorkspaceRole } from "../../entities/workspace-member.entity";

export class CreateInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(["owner", "admin", "member", "viewer"])
  @IsNotEmpty()
  role: WorkspaceRole;
}

