import type { Knex } from 'knex';

const baseConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '4000'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bakery',
    ssl: { rejectUnauthorized: true },
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/migrations',
    loadExtensions: ['.ts'],
  },
  seeds: {
    directory: './src/seeds',
    loadExtensions: ['.ts'],
  },
} as const;

const config: { [key: string]: Knex.Config } = {
  development: baseConfig,
  production: {
    ...baseConfig,
    pool: { min: 5, max: 20 },
  },
};

export default config;
