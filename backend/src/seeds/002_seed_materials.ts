import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const existing = await knex('materials').first();
  if (existing) {
    console.log('Materials already seeded, skipping');
    return;
  }

  await knex('materials').insert([
    { name: '甜面团', type: 'dough', created_at: new Date() },
    { name: '咸面团', type: 'dough', created_at: new Date() },
    { name: '法式面团', type: 'dough', created_at: new Date() },
    { name: '全麦面团', type: 'dough', created_at: new Date() },
    { name: '红豆馅', type: 'preparation', created_at: new Date() },
    { name: '绿豆馅', type: 'preparation', created_at: new Date() },
    { name: '芋泥馅', type: 'preparation', created_at: new Date() },
  ]);

  console.log('Seed materials created: dough types and preparations');
}