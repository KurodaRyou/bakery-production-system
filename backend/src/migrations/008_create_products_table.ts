import type { Knex } from 'knex';

/**
 * Migration 008: Create products table (产品)
 * Based on AGENTS.md schema (verified 2026-04-27)
 * Idempotent - safe to run multiple times
 */
export async function up(knex: Knex): Promise<void> {
  const hasProducts = await knex.schema.hasTable('products');
  if (!hasProducts) {
    await knex.schema.createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name', 255).notNullable();
      table.integer('dough_id').unsigned().nullable();
      table.foreign('dough_id').references('doughs.id');
      table.json('other_ingredients').nullable();
      table.text('description').nullable();
      table.timestamp('created_at').nullable();
      table.timestamp('updated_at').nullable();
    });
    console.log('products table created');
  } else {
    console.log('products table already exists, skipping');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('products');
  console.log('products table dropped');
}