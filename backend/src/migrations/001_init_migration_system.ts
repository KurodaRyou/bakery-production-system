import type { Knex } from 'knex';

/**
 * Baseline migration - confirms Knex migration system is configured.
 * Knex auto-creates knex_migrations table for tracking applied migrations.
 * Idempotent - safe to run multiple times.
 */
export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('knex_migrations');
  if (!hasTable) {
    throw new Error('knex_migrations table should be auto-created by Knex');
  }
}

export async function down(knex: Knex): Promise<void> {
  // Baseline marker - nothing to roll back
}
