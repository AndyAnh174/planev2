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
import { Board } from "../../entities/board.entity";
import { User } from "../../../users/entities/user.entity";

@Entity("cards")
@Index(["boardId", "columnId", "orderIndex"])
@Index(["assigneeId"])
@Index(["dueDate"])
export class Card {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "board_id" })
  boardId: string;

  @Column({ name: "column_id", type: "varchar", length: 100 })
  columnId: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ name: "assignee_id", nullable: true })
  assigneeId?: string;

  @Column({ name: "due_date", nullable: true, type: "timestamp" })
  dueDate?: Date;

  @Column({ type: "jsonb", nullable: true })
  labels?: string[];

  @Column({ name: "order_index", type: "int" })
  orderIndex: number;

  @ManyToOne(() => Board, (board) => board.cards)
  @JoinColumn({ name: "board_id" })
  board: Board;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "assignee_id" })
  assignee?: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

