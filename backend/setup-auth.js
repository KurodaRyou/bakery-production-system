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
        console.log('Creating roles table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(50) NOT NULL UNIQUE
            )
        `);
        console.log('roles table created');

        console.log('Inserting default roles...');
        await pool.query("INSERT IGNORE INTO roles (id, name) VALUES (1, 'admin'), (2, 'user')");
        console.log('Default roles inserted');

        console.log('Creating users table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(100) DEFAULT NULL,
                password VARCHAR(255) NOT NULL,
                role_id INT DEFAULT 2,
                can_view_recipes TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES roles(id)
            )
        `);
        console.log('users table created');

        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        console.log('Creating admin user...');
        await pool.query(
            "INSERT IGNORE INTO users (username, name, password, role_id) VALUES (?, ?, ?, 1)",
            ['admin', '管理员', hashedPassword]
        );
        console.log('Admin user created (username: admin, name: 管理员)');

        console.log('Creating ingredients table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ingredients (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                type VARCHAR(20) DEFAULT 'additive',
                default_unit VARCHAR(20) DEFAULT '%',
                manufacturer VARCHAR(100) DEFAULT NULL,
                spec VARCHAR(50) DEFAULT NULL,
                price DECIMAL(10,2) DEFAULT NULL
            )
        `);
        console.log('ingredients table created');

        console.log('Inserting common ingredients...');
        await pool.query("INSERT IGNORE INTO ingredients (name, type) VALUES ('面粉', 'flour'), ('水', 'water'), ('盐', 'salt'), ('糖', 'sugar'), ('干酵母', 'leavening'), ('黄油', 'lipids'), ('鸡蛋', 'protein'), ('牛奶', 'dairy'), ('奶粉', 'dairy'), ('海藻糖', 'flour'), ('麦芽精', 'sugar'), ('橄榄油', 'lipids'), ('蜂蜜', 'sugar')");
        console.log('Ingredients inserted');

        console.log('Setup complete!');
        console.log('Username: admin, Password:', adminPassword);

    } catch (error) {
        console.error('Setup error:', error.message);
    }

    process.exit(0);
}

setup();
