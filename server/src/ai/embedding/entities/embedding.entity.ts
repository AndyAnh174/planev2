import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from "typeorm";

@Entity("embeddings")
@Index(["blockId"])
@Index(["pageId"])
export class Embedding {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "block_id" })
  blockId: string;

  @Column({ name: "page_id" })
  pageId: string;

  @Column({ type: "vector", length: 1024 })
  vector: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}

