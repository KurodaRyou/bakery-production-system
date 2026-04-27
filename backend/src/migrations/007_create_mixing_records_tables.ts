import type { Knex } from 'knex';

/**
 * Migration 007: Create mixing_records tables (打面记录)
 * Based on AGENTS.md schema (verified 2026-04-27)
 * Tables: mixing_records, mixing_machines
 * Idempotent - safe to run multiple times
 */
export async function up(knex: Knex): Promise<void> {
  // mixing_machines:打面机
  const hasMachines = await knex.schema.hasTable('mixing_machines');
  if (!hasMachines) {
    await knex.schema.createTable('mixing_machines', (table) => {
      table.increments('id').primary();
      table.string('name', 50).notNullable();
    });
    console.log('mixing_machines table created');
  } else {
    console.log('mixing_machines table already exists, skipping');
  }

  // mixing_records:打面记录
  const hasRecords = await knex.schema.hasTable('mixing_records');
  if (!hasRecords) {
    await knex.schema.createTable('mixing_records', (table) => {
      table.string('batch_number', 10).primary();
      table.string('dough_name', 100).notNullable();
      table.decimal('dry_temp', 4, 1).nullable();
      table.decimal('room_temp', 4, 1).nullable();
      table.decimal('ice_ratio', 3, 2).nullable();
      table.decimal('water_temp', 4, 1).nullable();
      table.decimal('flour_amount', 6, 2).nullable();
      table.decimal('water_amount', 6, 2).nullable();
      table.decimal('dough_weight', 6, 2).nullable();
      table.string('machine_speed', 50).nullable();
      table.decimal('gluten_level', 3, 2).nullable();
      table.decimal('output_temp', 4, 1).nullable();
      table.string('machine', 50).nullable();
      table.string('operator', 50).nullable();
      table.decimal('bulk_ferment_temp', 4, 1).nullable();
      table.integer('bulk_ferment_time').nullable();
      table.timestamp('created_at').nullable();
      table.timestamp('updated_at').nullable();
      table.string('timezone', 20).nullable();
    });
    console.log('mixing_records table created');
  } else {
    console.log('mixing_records table already exists, skipping');
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('mixing_records');
  console.log('mixing_records table dropped');
  await knex.schema.dropTableIfExists('mixing_machines');
  console.log('mixing_machines table dropped');
}