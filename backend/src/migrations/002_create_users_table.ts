import type { Knex } from 'knex';

/**
 * Migration 002: Create users table
 * Based on AGENTS.md schema (verified 2026-04-27)
 * Idempotent - safe to run multiple times
 */
export async function up(knex: Knex): Promise<void> {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username', 50).notNullable().unique();
      table.string('name', 100).nullable();
      table.string('password', 255).notNullable();
      table.string('role', 20).defaultTo('staff'); // 'admin', 'manager', 'staff'
      table.tinyint('can_view_recipes').defaultTo(0);
      table.string('api_token', 64).nullable();
      table.datetime('created_at').nullable();
      table.string('timezone', 20).nullable();
    });
    console.log('users table created');
  } else {
    console.log('users table already exists, skipping');
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasUsers = await knex.schema.hasTable('users');
  if (hasUsers) {
    await knex.schema.dropTableIfExists('users');
    console.log('users table dropped');
  }
}