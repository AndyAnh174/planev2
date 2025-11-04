import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1699123456789 implements MigrationInterface {
  name = "InitialSchema1699123456789";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "password_hash" character varying,
        "avatar_url" text,
        "gitlab_id" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_gitlab_id" UNIQUE ("gitlab_id"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create workspaces table
    await queryRunner.query(`
      CREATE TABLE "workspaces" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "avatar_url" text,
        "owner_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_workspaces_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_workspaces" PRIMARY KEY ("id")
      )
    `);

    // Create workspace_members table
    await queryRunner.query(`
      CREATE TABLE "workspace_members" (
        "workspace_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" character varying(20) NOT NULL,
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_workspace_members" PRIMARY KEY ("workspace_id", "user_id")
      )
    `);

    // Create pages table
    await queryRunner.query(`
      CREATE TABLE "pages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspace_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "visibility" character varying(20) NOT NULL DEFAULT 'private',
        "author_id" uuid NOT NULL,
        "is_indexed" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pages" PRIMARY KEY ("id")
      )
    `);

    // Create blocks table
    await queryRunner.query(`
      CREATE TABLE "blocks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "page_id" uuid NOT NULL,
        "type" character varying(50) NOT NULL,
        "content" jsonb NOT NULL,
        "order_index" integer NOT NULL,
        "parent_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blocks" PRIMARY KEY ("id")
      )
    `);

    // Create page_history table
    await queryRunner.query(`
      CREATE TABLE "page_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "page_id" uuid NOT NULL,
        "content_snapshot" jsonb NOT NULL,
        "version" integer NOT NULL,
        "author_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_page_history" PRIMARY KEY ("id")
      )
    `);

    // Create block_history table
    await queryRunner.query(`
      CREATE TABLE "block_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "block_id" uuid NOT NULL,
        "content_snapshot" jsonb NOT NULL,
        "version" integer NOT NULL,
        "author_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_block_history" PRIMARY KEY ("id")
      )
    `);

    // Create boards table
    await queryRunner.query(`
      CREATE TABLE "boards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspace_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_boards" PRIMARY KEY ("id")
      )
    `);

    // Create cards table
    await queryRunner.query(`
      CREATE TABLE "cards" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "board_id" uuid NOT NULL,
        "column_id" character varying(100) NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "assignee_id" uuid,
        "due_date" TIMESTAMP,
        "labels" jsonb,
        "order_index" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cards" PRIMARY KEY ("id")
      )
    `);

    // Create comments table
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "target_type" character varying(20) NOT NULL,
        "target_id" uuid NOT NULL,
        "author_id" uuid NOT NULL,
        "content" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments" PRIMARY KEY ("id")
      )
    `);

    // Create file_uploads table
    await queryRunner.query(`
      CREATE TABLE "file_uploads" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspace_id" uuid NOT NULL,
        "uploader_id" uuid NOT NULL,
        "filename" character varying NOT NULL,
        "original_name" character varying NOT NULL,
        "mime_type" character varying NOT NULL,
        "size" bigint NOT NULL,
        "minio_path" character varying NOT NULL,
        "url" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_file_uploads" PRIMARY KEY ("id")
      )
    `);

    // Create embeddings table (without vector extension first)
    await queryRunner.query(`
      CREATE TABLE "embeddings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "block_id" uuid NOT NULL,
        "page_id" uuid NOT NULL,
        "vector" text,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_embeddings" PRIMARY KEY ("id")
      )
    `);

    // Create foreign keys
    await queryRunner.query(`
      ALTER TABLE "workspaces"
      ADD CONSTRAINT "FK_workspaces_owner_id"
      FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "workspace_members"
      ADD CONSTRAINT "FK_workspace_members_workspace_id"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "FK_workspace_members_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "pages"
      ADD CONSTRAINT "FK_pages_workspace_id"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "FK_pages_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "blocks"
      ADD CONSTRAINT "FK_blocks_page_id"
      FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "FK_blocks_parent_id"
      FOREIGN KEY ("parent_id") REFERENCES "blocks"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "page_history"
      ADD CONSTRAINT "FK_page_history_page_id"
      FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "FK_page_history_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "block_history"
      ADD CONSTRAINT "FK_block_history_block_id"
      FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "FK_block_history_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "boards"
      ADD CONSTRAINT "FK_boards_workspace_id"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "cards"
      ADD CONSTRAINT "FK_cards_board_id"
      FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "FK_cards_assignee_id"
      FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "comments"
      ADD CONSTRAINT "FK_comments_author_id"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "file_uploads"
      ADD CONSTRAINT "FK_file_uploads_workspace_id"
      FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "FK_file_uploads_uploader_id"
      FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_pages_workspace_id_visibility"
      ON "pages" ("workspace_id", "visibility")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_pages_author_id"
      ON "pages" ("author_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_pages_slug"
      ON "pages" ("slug")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_blocks_page_id_order_index"
      ON "blocks" ("page_id", "order_index")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_blocks_parent_id"
      ON "blocks" ("parent_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_blocks_type"
      ON "blocks" ("type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_page_history_page_id"
      ON "page_history" ("page_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_page_history_page_id_version"
      ON "page_history" ("page_id", "version")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_block_history_block_id"
      ON "block_history" ("block_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_block_history_block_id_version"
      ON "block_history" ("block_id", "version")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_boards_workspace_id"
      ON "boards" ("workspace_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cards_board_id_column_id_order_index"
      ON "cards" ("board_id", "column_id", "order_index")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cards_assignee_id"
      ON "cards" ("assignee_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_cards_due_date"
      ON "cards" ("due_date")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comments_target_type_target_id"
      ON "comments" ("target_type", "target_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_comments_author_id"
      ON "comments" ("author_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_uploads_workspace_id"
      ON "file_uploads" ("workspace_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_uploads_uploader_id"
      ON "file_uploads" ("uploader_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_file_uploads_mime_type"
      ON "file_uploads" ("mime_type")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_embeddings_block_id"
      ON "embeddings" ("block_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_embeddings_page_id"
      ON "embeddings" ("page_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_embeddings_page_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_embeddings_block_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_file_uploads_mime_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_file_uploads_uploader_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_file_uploads_workspace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comments_author_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_comments_target_type_target_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cards_due_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cards_assignee_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_cards_board_id_column_id_order_index"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_boards_workspace_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_block_history_block_id_version"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_block_history_block_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_page_history_page_id_version"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_page_history_page_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blocks_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blocks_parent_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_blocks_page_id_order_index"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pages_slug"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pages_author_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pages_workspace_id_visibility"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "file_uploads" DROP CONSTRAINT IF EXISTS "FK_file_uploads_uploader_id"`);
    await queryRunner.query(`ALTER TABLE "file_uploads" DROP CONSTRAINT IF EXISTS "FK_file_uploads_workspace_id"`);
    await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT IF EXISTS "FK_comments_author_id"`);
    await queryRunner.query(`ALTER TABLE "cards" DROP CONSTRAINT IF EXISTS "FK_cards_assignee_id"`);
    await queryRunner.query(`ALTER TABLE "cards" DROP CONSTRAINT IF EXISTS "FK_cards_board_id"`);
    await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT IF EXISTS "FK_boards_workspace_id"`);
    await queryRunner.query(`ALTER TABLE "block_history" DROP CONSTRAINT IF EXISTS "FK_block_history_author_id"`);
    await queryRunner.query(`ALTER TABLE "block_history" DROP CONSTRAINT IF EXISTS "FK_block_history_block_id"`);
    await queryRunner.query(`ALTER TABLE "page_history" DROP CONSTRAINT IF EXISTS "FK_page_history_author_id"`);
    await queryRunner.query(`ALTER TABLE "page_history" DROP CONSTRAINT IF EXISTS "FK_page_history_page_id"`);
    await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT IF EXISTS "FK_blocks_parent_id"`);
    await queryRunner.query(`ALTER TABLE "blocks" DROP CONSTRAINT IF EXISTS "FK_blocks_page_id"`);
    await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "FK_pages_author_id"`);
    await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "FK_pages_workspace_id"`);
    await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT IF EXISTS "FK_workspace_members_user_id"`);
    await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT IF EXISTS "FK_workspace_members_workspace_id"`);
    await queryRunner.query(`ALTER TABLE "workspaces" DROP CONSTRAINT IF EXISTS "FK_workspaces_owner_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "embeddings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "file_uploads"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "boards"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "block_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "page_history"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "blocks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workspace_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workspaces"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}

