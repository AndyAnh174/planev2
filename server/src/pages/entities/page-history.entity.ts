import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from "typeorm";
import { Page } from "./page.entity";
import { User } from "../../users/entities/user.entity";

@Entity("page_history")
@Index(["pageId"])
@Index(["pageId", "version"])
export class PageHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "page_id" })
  pageId: string;

  @Column({ name: "content_snapshot", type: "jsonb" })
  contentSnapshot: Record<string, any>;

  @Column({ type: "int" })
  version: number;

  @Column({ name: "author_id" })
  authorId: string;

  @ManyToOne(() => Page)
  @JoinColumn({ name: "page_id" })
  page: Page;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

