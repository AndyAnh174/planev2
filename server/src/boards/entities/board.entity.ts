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
import { Card } from "../cards/entities/card.entity";

@Entity("boards")
@Index(["workspaceId"])
export class Board {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "workspace_id" })
  workspaceId: string;

  @Column()
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => Workspace)
  @JoinColumn({ name: "workspace_id" })
  workspace: Workspace;

  @OneToMany(() => Card, (card) => card.board)
  cards: Card[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

