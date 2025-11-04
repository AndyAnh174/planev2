# Database Migrations

This directory contains TypeORM migration files for managing database schema changes.

## Migration Files

- `1699123456789-InitialSchema.ts` - Initial database schema with all tables
- `1699123456790-EnablePgvector.ts` - Enables pgvector extension for vector search
- `1699123456791-CreateEmbeddingsIndex.ts` - Creates IVFFlat index for embeddings vector column

## Running Migrations

### Run all pending migrations
```bash
npm run migration:run
```

### Revert last migration
```bash
npm run migration:revert
```

### Show migration status
```bash
npm run migration:show
```

### Generate new migration from entity changes
```bash
npm run migration:generate src/database/migrations/YourMigrationName
```

### Create empty migration file
```bash
npm run migration:create src/database/migrations/YourMigrationName
```

## Notes

- Migrations are automatically run in production (`migrationsRun: true`)
- In development, `synchronize: true` is enabled (schema auto-sync)
- Always test migrations in development before deploying to production
- IVFFlat index for embeddings requires sufficient data (>1000 vectors) to be effective

## Environment Variables

Make sure these are set:
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `DB_NAME` - Database name (default: notion)

