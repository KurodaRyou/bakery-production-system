require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'bakery',
    ssl: { rejectUnauthorized: true },
    connectTimeout: 10000
  });

  try {
    await pool.query(`
      CREATE TABLE ingredients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        default_unit VARCHAR(20) DEFAULT '%'
      )
    `);
    console.log('ingredients table created');
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log('Table already exists');
    } else {
      console.error('Create table error:', e.message);
    }
  }

  try {
    await pool.query("INSERT IGNORE INTO ingredients (name) VALUES ('面粉'), ('水'), ('盐'), ('糖'), ('干酵母'), ('黄油'), ('鸡蛋'), ('牛奶'), ('奶粉'), ('海藻糖'), ('麦芽精'), ('橄榄油'), ('玉米油'), ('黄油'), ('蜂蜜'), ('五得利910'), ('金顶焙'), ('王后T55'), ('王后T65')");
    console.log('Ingredients inserted');
  } catch (e) {
    console.error('Insert error:', e.message);
  }

  try {
    const [rows] = await pool.query('SELECT * FROM ingredients ORDER BY name');
    console.log('Current ingredients:', rows);
  } catch (e) {
    console.error('Select error:', e.message);
  }

  process.exit(0);
}

run();