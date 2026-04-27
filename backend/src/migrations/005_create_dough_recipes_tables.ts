import type { Knex } from 'knex';

/**
 * Migration 005: Create dough_recipes tables (配方主表 + 版本 + 原料)
 * Based on AGENTS.md schema (verified 2026-04-27)
 * Tables: dough_recipes, dough_recipe_versions, dough_recipe_ingredients_current, dough_recipe_ingredients_archive
 * Idempotent - safe to run multiple times
 */
export async function up(knex: Knex): Promise<void> {
  // dough_recipes:配方主表
  const hasDoughRecipes = await knex.schema.hasTable('dough_recipes');
  if (!hasDoughRecipes) {
    await knex.schema.createTable('dough_recipes', (table) => {
      table.increments('id').primary();
      table.string('name', 255).nullable();
      table.integer('material_id').unsigned().nullable();
      table.foreign('material_id').references('materials.id');
      table.integer('source_id').unsigned().nullable();
      table.string('author', 100).nullable();
      table.string('current_version', 20).nullable();
      table.datetime('created_at').nullable();
      table.datetime('updated_at').nullable();
      table.string('timezone', 20).defaultTo('Asia/Shanghai');
    });
    console.log('dough_recipes table created');
  } else {
    console.log('dough_recipes table already exists, skipping');
  }

  // dough_recipe_versions:配方版本
  const hasDoughRecipeVersions = await knex.schema.hasTable('dough_recipe_versions');
  if (!hasDoughRecipeVersions) {
    await knex.schema.createTable('dough_recipe_versions', (table) => {
      table.increments('id').primary();
      table.integer('recipe_id').unsigned().notNullable();
      table.foreign('recipe_id').references('dough_recipes.id');
      table.string('version_number', 20).notNullable();
      table.decimal('expected_temp', 4, 1).nullable();
      table.datetime('created_at').nullable();
      table.string('timezone', 20).nullable();
    });
    console.log('dough_recipe_versions table created');
  } else {
    console.log('dough_recipe_versions table already exists, skipping');
  }

  // dough_recipe_ingredients_current:当前版本配方原料
  const hasCurrent = await knex.schema.hasTable('dough_recipe_ingredients_current');
  if (!hasCurrent) {
    await knex.schema.createTable('dough_recipe_ingredients_current', (table) => {
      table.increments('id').primary();
      table.integer('recipe_id').unsigned().notNullable();
      table.foreign('recipe_id').references('dough_recipes.id');
      table.integer('material_id').unsigned().nullable();
      table.foreign('material_id').references('materials.id');
      table.string('version', 20).nullable();
      table.enum('stage', ['preferment', 'base', 'late']).defaultTo('base');
      table.decimal('percentage', 5, 2).nullable();
      table.string('note', 1000).nullable();
      table.string('unit', 20).nullable();
      table.decimal('loss_rate', 5, 2).defaultTo(1.00);
      table.datetime('created_at').nullable();
      table.datetime('updated_at').nullable();
    });
    console.log('dough_recipe_ingredients_current table created');
  } else {
    console.log('dough_recipe_ingredients_current table already exists, skipping');
  }

  // dough_recipe_ingredients_archive:历史版本配方原料
  const hasArchive = await knex.schema.hasTable('dough_recipe_ingredients_archive');
  if (!hasArchive) {
    await knex.schema.createTable('dough_recipe_ingredients_archive', (table) => {
      table.increments('id').primary();
      table.integer('version_id').unsigned().nullable();
      table.foreign('version_id').references('dough_recipe_versions.id');
      table.integer('material_id').unsigned().nullable();
      table.foreign('material_id').references('materials.id');
      table.enum('stage', ['preferment', 'base', 'late']).defaultTo('base');
      table.decimal('percentage', 5, 2).nullable();
      table.string('note', 1000).nullable();
      table.string('unit', 20).nullable();
      table.decimal('loss_rate', 5, 2).defaultTo(1.00);
    });
    console.log('dough_recipe_ingredients_archive table created');
  } else {
    console.log('dough_recipe_ingredients_archive table already exists, skipping');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('dough_recipe_ingredients_archive');
  console.log('dough_recipe_ingredients_archive table dropped');
  await knex.schema.dropTableIfExists('dough_recipe_ingredients_current');
  console.log('dough_recipe_ingredients_current table dropped');
  await knex.schema.dropTableIfExists('dough_recipe_versions');
  console.log('dough_recipe_versions table dropped');
  await knex.schema.dropTableIfExists('dough_recipes');
  console.log('dough_recipes table dropped');
}