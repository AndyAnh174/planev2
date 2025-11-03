import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Page } from "../../entities/page.entity";
import { BlockHistory } from "./block-history.entity";

export type BlockType =
  | "text"
  | "heading"
  | "code"
  | "table"
  | "checklist"
  | "image"
  | "embed"
  | "quote"
  | "divider";

@Entity("blocks")
@Index(["pageId", "orderIndex"])
@Index(["parentId"])
@Index(["type"])
export class Block {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "page_id" })
  pageId: string;

  @Column({ type: "varchar", length: 50 })
  type: BlockType;

  @Column({ type: "jsonb" })
  content: Record<string, any>;

  @Column({ name: "order_index", type: "int" })
  orderIndex: number;

  @Column({ name: "parent_id", nullable: true })
  parentId?: string;

  @ManyToOne(() => Page, (page) => page.blocks)
  @JoinColumn({ name: "page_id" })
  page: Page;

  @ManyToOne(() => Block, { nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent?: Block;

  @OneToMany(() => BlockHistory, (history) => history.block)
  history: BlockHistory[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

