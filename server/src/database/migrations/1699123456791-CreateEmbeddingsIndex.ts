import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmbeddingsIndex1699123456791 implements MigrationInterface {
  name = "CreateEmbeddingsIndex1699123456791";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create IVFFlat index for embeddings vector column
    // Note: IVFFlat index is only effective when there's sufficient data (recommended > 1000 vectors)
    // This index will be created but may need to be recreated after data is loaded
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "embeddings_vector_idx"
      ON "embeddings"
      USING ivfflat (vector vector_cosine_ops)
      WITH (lists = 100)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "embeddings_vector_idx"`);
  }
}

