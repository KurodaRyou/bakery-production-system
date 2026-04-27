import type { Knex } from 'knex';

/**
 * Migration 006: Create preparations tables (半成品)
 * Based on AGENTS.md schema (verified 2026-04-27)
 * Tables: preparations, preparation_recipes, preparation_versions, preparation_ingredients_current, preparation_ingredients_archive
 * Idempotent - safe to run multiple times
 */
export async function up(knex: Knex): Promise<void> {
  // preparations:半成品类型
  const hasPreparations = await knex.schema.hasTable('preparations');
  if (!hasPreparations) {
    await knex.schema.createTable('preparations', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.integer('material_id').unsigned().nullable();
      table.foreign('material_id').references('materials.id');
      table.text('description').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('preparations table created');
  } else {
    console.log('preparations table already exists, skipping');
  }

  // preparation_recipes:半成品配方
  const hasPrepRecipes = await knex.schema.hasTable('preparation_recipes');
  if (!hasPrepRecipes) {
    await knex.schema.createTable('preparation_recipes', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.integer('preparation_id').unsigned().notNullable();
      table.foreign('preparation_id').references('preparations.id');
      table.integer('material_id').unsigned().nullable();
      table.foreign('material_id').references('materials.id');
      table.string('type', 50).nullable();
      table.text('notes').nullable();
      table.string('author', 100).nullable();
      table.string('current_version', 20).nullable();
      table.timestamp('created_at').nullable();
      table.datetime('updated_at').nullable();
      table.string('timezone', 20).nullable();
    });
    console.log('preparation_recipes table created');
  } else {
    console.log('preparation_recipes table already exists, skipping');
  }

  // preparation_versions:半成品版本
  const hasPrepVersions = await knex.schema.hasTable('preparation_versions');
  if (!hasPrepVersions) {
    await knex.schema.createTable('preparation_versions', (table) => {
      table.increments('id').primary();
      table.integer('recipe_id').unsigned().notNullable();
      table.foreign('recipe_id').references('preparation_recipes.id');
      table.string('version_number', 20).notNullable();
      table.datetime('created_at').nullable();
      table.string('timezone', 20).nullable();
    });
    console.log('preparation_versions table created');
  } else {
    console.log('preparation_versions table already exists, skipping');
  }

  // preparation_ingredients_current:当前版本半成品原料
  const hasPic = await knex.schema.hasTable('preparation_ingredients_current');
  if (!hasPic) {
    await knex.schema.createTable('preparation_ingredients_current', (table) => {
      table.increments('id').primary();
      table.integer('preparation_recipe_id').unsigned().notNullable();
      table.foreign('preparation_recipe_id').references('preparation_recipes.id');
      table.integer('material_id').unsigned().nullable();
      table.foreign('material_id').references('materials.id');
      table.decimal('percentage', 5, 2).nullable();
      table.string('stage', 20).defaultTo('base');
      table.string('note', 1000).nullable();
      table.string('unit', 20).nullable();
      table.string('version', 20).nullable();
      table.decimal('loss_rate', 5, 2).defaultTo(1.00);
      table.timestamp('created_at').nullable();
      table.timestamp('updated_at').nullable();
    });
    console.log('preparation_ingredients_current table created');
  } else {
    console.log('preparation_ingredients_current table already exists, skipping');
  }

  // preparation_ingredients_archive:历史版本半成品原料
  const hasPia = await knex.schema.hasTable('preparation_ingredients_archive');
  if (!hasPia) {
    await knex.schema.createTable('preparation_ingredients_archive', (table) => {
      table.increments('id').primary();
      table.integer('version_id').unsigned().nullable();
      table.foreign('version_id').references('preparation_versions.id');
      table.integer('material_id').unsigned().nullable();
      table.foreign('material_id').references('materials.id');
      table.string('stage', 20).defaultTo('base');
      table.decimal('percentage', 5, 2).nullable();
      table.string('note', 1000).nullable();
      table.string('unit', 20).nullable();
      table.decimal('loss_rate', 5, 2).defaultTo(1.00);
    });
    console.log('preparation_ingredients_archive table created');
  } else {
    console.log('preparation_ingredients_archive table already exists, skipping');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('preparation_ingredients_archive');
  console.log('preparation_ingredients_archive table dropped');
  await knex.schema.dropTableIfExists('preparation_ingredients_current');
  console.log('preparation_ingredients_current table dropped');
  await knex.schema.dropTableIfExists('preparation_versions');
  console.log('preparation_versions table dropped');
  await knex.schema.dropTableIfExists('preparation_recipes');
  console.log('preparation_recipes table dropped');
  await knex.schema.dropTableIfExists('preparations');
  console.log('preparations table dropped');
}