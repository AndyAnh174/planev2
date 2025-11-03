import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Block } from "./block.entity";
import { User } from "../../../users/entities/user.entity";

@Entity("block_history")
@Index(["blockId"])
@Index(["blockId", "version"])
export class BlockHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "block_id" })
  blockId: string;

  @Column({ name: "content_snapshot", type: "jsonb" })
  contentSnapshot: Record<string, any>;

  @Column({ type: "int" })
  version: number;

  @Column({ name: "author_id" })
  authorId: string;

  @ManyToOne(() => Block, (block) => block.history)
  @JoinColumn({ name: "block_id" })
  block: Block;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

