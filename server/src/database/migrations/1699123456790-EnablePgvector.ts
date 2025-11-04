import { MigrationInterface, QueryRunner } from "typeorm";

export class EnablePgvector1699123456790 implements MigrationInterface {
  name = "EnablePgvector1699123456790";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable pgvector extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
    
    // Alter embeddings table to use vector type
    // If column is text, convert it; if already vector, do nothing
    await queryRunner.query(`
      ALTER TABLE "embeddings"
      ALTER COLUMN "vector" TYPE vector(1024) USING 
        CASE 
          WHEN vector IS NULL THEN NULL
          WHEN pg_typeof(vector)::text = 'text' THEN vector::vector
          ELSE vector
        END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert vector column back to text
    await queryRunner.query(`
      ALTER TABLE "embeddings"
      ALTER COLUMN "vector" TYPE text USING vector::text
    `);
    
    // Note: We don't drop the extension as it might be used by other databases
    // await queryRunner.query(`DROP EXTENSION IF EXISTS vector`);
  }
}

