import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Workspace } from "../../entities/workspace.entity";
import { User } from "../../../users/entities/user.entity";
import type { WorkspaceRole } from "../../entities/workspace-member.entity";

@Entity("workspace_invitations")
export class WorkspaceInvitation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "workspace_id" })
  workspaceId: string;

  @Column({ name: "email" })
  email: string;

  @Column({
    type: "varchar",
    length: 20,
  })
  role: WorkspaceRole;

  @Column({ name: "token", unique: true })
  token: string;

  @Column({ name: "invited_by" })
  invitedBy: string;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt: Date;

  @Column({ name: "accepted_at", type: "timestamp", nullable: true })
  acceptedAt: Date | null;

  @Column({ name: "rejected_at", type: "timestamp", nullable: true })
  rejectedAt: Date | null;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: "workspace_id" })
  workspace: Workspace;

  @ManyToOne(() => User)
  @JoinColumn({ name: "invited_by" })
  inviter: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

