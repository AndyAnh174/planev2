import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Workspace } from "./workspace.entity";
import { User } from "../../users/entities/user.entity";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

@Entity("workspace_members")
export class WorkspaceMember {
  @PrimaryColumn({ name: "workspace_id" })
  workspaceId: string;

  @PrimaryColumn({ name: "user_id" })
  userId: string;

  @Column({
    type: "varchar",
    length: 20,
  })
  role: WorkspaceRole;

  @ManyToOne(() => Workspace, (workspace) => workspace.members)
  @JoinColumn({ name: "workspace_id" })
  workspace: Workspace;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn({ name: "joined_at" })
  joinedAt: Date;
}

