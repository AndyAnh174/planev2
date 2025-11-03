import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: "password_hash", nullable: true })
  passwordHash?: string;

  @Column({ name: "avatar_url", nullable: true, type: "text" })
  avatarUrl?: string;

  @Column({ name: "gitlab_id", unique: true, nullable: true })
  gitlabId?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

