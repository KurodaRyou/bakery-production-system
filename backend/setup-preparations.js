require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 4000,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'bakery',
        ssl: { rejectUnauthorized: true }
    });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        console.log('Step 1: Creating preparations table...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS preparations (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                material_id INT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (material_id) REFERENCES materials(id)
            )
        `);

        console.log('Step 2: Adding preparation_id column to preparation_recipes...');
        const [cols] = await conn.query("SHOW COLUMNS FROM preparation_recipes LIKE 'preparation_id'");
        if (cols.length === 0) {
            await conn.query('ALTER TABLE preparation_recipes ADD COLUMN preparation_id INT DEFAULT NULL');
        }

        console.log('Step 3: Migrating existing data...');
        await conn.query(`
            INSERT IGNORE INTO preparations (name, material_id, description)
            SELECT DISTINCT pr.name, pr.material_id, pr.notes
            FROM preparation_recipes pr
            WHERE pr.name IS NOT NULL
        `);

        await conn.query(`
            UPDATE preparation_recipes pr
            JOIN preparations p ON pr.name = p.name
            SET pr.preparation_id = p.id
            WHERE pr.preparation_id IS NULL
        `);

        console.log('Step 4: Making preparation_id NOT NULL...');
        await conn.query('ALTER TABLE preparation_recipes MODIFY COLUMN preparation_id INT NOT NULL');

        await conn.commit();
        console.log('Migration complete!');
    } catch (error) {
        await conn.rollback();
        console.error('Migration failed:', error);
        throw error;
    } finally {
        conn.release();
        await pool.end();
    }
}

migrate().catch(console.error);
