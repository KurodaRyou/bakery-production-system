import type { Knex } from 'knex';

/**
 * Migration 004: Create doughs table (面团类型)
 * Based on AGENTS.md schema (verified 2026-04-27)
 * Idempotent - safe to run multiple times
 */
export async function up(knex: Knex): Promise<void> {
  const hasDoughs = await knex.schema.hasTable('doughs');
  if (!hasDoughs) {
    await knex.schema.createTable('doughs', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.integer('material_id').unsigned().nullable();
      table.foreign('material_id').references('materials.id');
      table.text('description').nullable();
    });
    console.log('doughs table created');
  } else {
    console.log('doughs table already exists, skipping');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('doughs');
  console.log('doughs table dropped');
}