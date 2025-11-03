import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Workspace } from "../../workspaces/entities/workspace.entity";
import { User } from "../../users/entities/user.entity";

@Entity("file_uploads")
@Index(["workspaceId"])
@Index(["uploaderId"])
@Index(["mimeType"])
export class FileUpload {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "workspace_id" })
  workspaceId: string;

  @Column({ name: "uploader_id" })
  uploaderId: string;

  @Column()
  filename: string;

  @Column({ name: "original_name" })
  originalName: string;

  @Column({ name: "mime_type" })
  mimeType: string;

  @Column({ type: "bigint" })
  size: number;

  @Column({ name: "minio_path" })
  minioPath: string;

  @Column({ type: "text" })
  url: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: "workspace_id" })
  workspace: Workspace;

  @ManyToOne(() => User)
  @JoinColumn({ name: "uploader_id" })
  uploader: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

