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
import { Workspace } from "../../workspaces/entities/workspace.entity";
import { User } from "../../users/entities/user.entity";
import { Block } from "../blocks/entities/block.entity";

export type PageVisibility = "private" | "workspace" | "public";

@Entity("pages")
@Index(["workspaceId", "visibility"])
@Index(["authorId"])
@Index(["slug"])
export class Page {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "workspace_id" })
  workspaceId: string;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({
    type: "varchar",
    length: 20,
    default: "private",
  })
  visibility: PageVisibility;

  @Column({ name: "author_id" })
  authorId: string;

  @Column({ name: "is_indexed", default: false })
  isIndexed: boolean;

  @ManyToOne(() => Workspace, (workspace) => workspace.pages)
  @JoinColumn({ name: "workspace_id" })
  workspace: Workspace;

  @ManyToOne(() => User)
  @JoinColumn({ name: "author_id" })
  author: User;

  @OneToMany(() => Block, (block) => block.page)
  blocks: Block[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

