import type { Knex } from 'knex';

/**
 * Migration 003: Create materials (unified registry) and ingredients tables
 * Based on AGENTS.md schema (verified 2026-04-27)
 * materials must be created before ingredients (FK dependency)
 * Idempotent - safe to run multiple times
 */
export async function up(knex: Knex): Promise<void> {
  // materials: unified registry that all items link to
  const hasMaterials = await knex.schema.hasTable('materials');
  if (!hasMaterials) {
    await knex.schema.createTable('materials', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.enum('type', ['dough', 'ingredient', 'preparation']).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('materials table created');
  } else {
    console.log('materials table already exists, skipping');
  }

  // ingredients:原材料 (references materials.id)
  const hasIngredients = await knex.schema.hasTable('ingredients');
  if (!hasIngredients) {
    await knex.schema.createTable('ingredients', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.integer('material_id').unsigned().nullable();
      table.foreign('material_id').references('materials.id');
      table.enum('type', ['flour', 'lipids', 'sugar', 'salt', 'leavening', 'dairy', 'protein', 'water', 'additive', 'others']).defaultTo('others');
      table.tinyint('is_preparation').defaultTo(0);
      table.string('default_unit', 20).defaultTo('%');
      table.string('spec', 50).nullable();
      table.decimal('price', 10, 2).nullable();
      table.string('manufacturer', 100).nullable();
    });
    console.log('ingredients table created');
  } else {
    console.log('ingredients table already exists, skipping');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ingredients');
  console.log('ingredients table dropped');
  await knex.schema.dropTableIfExists('materials');
  console.log('materials table dropped');
}