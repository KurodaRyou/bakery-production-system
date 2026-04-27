import type { Knex } from 'knex';
import bcrypt from 'bcrypt';

const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
const SALT_ROUNDS = 10;

export async function seed(knex: Knex): Promise<void> {
  const exists = await knex('users').where('username', 'admin').first();
  if (exists) {
    console.log('Admin user already exists, skipping');
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, SALT_ROUNDS);

  await knex('users').insert([
    {
      username: 'admin',
      name: '管理员',
      password: hashedPassword,
      role: 'admin',
      can_view_recipes: 1,
      created_at: new Date(),
      timezone: 'Asia/Shanghai',
    },
    {
      username: 'test',
      name: '测试用户',
      password: await bcrypt.hash('test', SALT_ROUNDS),
      role: 'staff',
      can_view_recipes: 1,
      created_at: new Date(),
      timezone: 'Asia/Shanghai',
    },
  ]);

  console.log('Seed users created: admin (password: admin123), test (password: test)');
}