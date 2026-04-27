require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function setup() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 4000,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'bakery',
        ssl: { rejectUnauthorized: true }
    });

    try {
        const testUsername = process.env.TEST_USERNAME || 'test';
        const testPassword = process.env.TEST_PASSWORD || 'test';
        const testRole = process.env.TEST_ROLE || 'staff';

        const hashedPassword = await bcrypt.hash(testPassword, 10);

        console.log(`Creating test user: ${testUsername}...`);
        await pool.query(
            'INSERT INTO users (username, name, password, role, can_view_recipes) VALUES (?, ?, ?, ?, 0) ON DUPLICATE KEY UPDATE password = ?, name = ?',
            [testUsername, testUsername, hashedPassword, testRole, hashedPassword, testUsername]
        );
        console.log(`Test user created/updated: ${testUsername}/${testPassword} (role: ${testRole})`);

    } catch (error) {
        console.error('Setup error:', error.message);
    }

    process.exit(0);
}

setup();
