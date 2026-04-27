import type { Knex } from 'knex';

/**
 * Migration 009: Create workflow tables (工作流程)
 * Based on AGENTS.md schema (verified 2026-04-27)
 * Tables: workflow_templates, workday_slots
 * Idempotent - safe to run multiple times
 */
export async function up(knex: Knex): Promise<void> {
  // workflow_templates:工作流程模板
  const hasTemplates = await knex.schema.hasTable('workflow_templates');
  if (!hasTemplates) {
    await knex.schema.createTable('workflow_templates', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.integer('user_id').unsigned().nullable();
      table.foreign('user_id').references('users.id');
      table.json('steps').notNullable();
      table.tinyint('is_active').defaultTo(1);
      table.timestamp('created_at').nullable();
      table.timestamp('updated_at').nullable();
    });
    console.log('workflow_templates table created');
  } else {
    console.log('workflow_templates table already exists, skipping');
  }

  // workday_slots:工作日程槽
  const hasSlots = await knex.schema.hasTable('workday_slots');
  if (!hasSlots) {
    await knex.schema.createTable('workday_slots', (table) => {
      table.increments('id').primary();
      table.date('date').notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users.id');
      table.integer('slot_index').notNullable();
      table.string('task_type', 50).nullable();
      table.integer('product_id').unsigned().nullable();
      table.foreign('product_id').references('products.id');
      table.string('description', 255).nullable();
      table.integer('duration_slots').defaultTo(1);
      table.tinyint('is_temporary').defaultTo(0);
      table.string('status', 20).defaultTo('pending');
      table.timestamp('created_at').nullable();
      table.timestamp('updated_at').nullable();
      table.string('timezone', 20).nullable();
    });
    console.log('workday_slots table created');
  } else {
    console.log('workday_slots table already exists, skipping');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workday_slots');
  console.log('workday_slots table dropped');
  await knex.schema.dropTableIfExists('workflow_templates');
  console.log('workflow_templates table dropped');
}