import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

export type CommentTargetType = "page" | "block" | "card";

@Entity("comments")
@Index(["targetType", "targetId"])
@Index(["authorId"])
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "target_type", type: "varchar", length: 20 })
  targetType: CommentTargetType;

  @Column({ name: "target_id" })
  targetId: string;

  @Column({ name: "author_id" })
  authorId: string;

  @Column({ type: "text" })
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

