import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import type { WorkspaceRole } from "../entities/workspace-member.entity";

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(["owner", "admin", "member", "viewer"])
  @IsNotEmpty()
  role: WorkspaceRole;
}

