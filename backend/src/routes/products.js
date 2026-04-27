const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

/**
 * 获取产品列表
 * GET /api/products
 * 
 * products 表结构:
 * - id, name, dough_id, other_ingredients(JSON), description
 * 
 * 产品与面团关系: products.dough_id -> dough_types.id
 */
router.get('/products', requireAuth, async (req, res) => {
    try {
        // TODO: 暂时注释，等真实数据
        // const [rows] = await pool.query(`
        //     SELECT p.*, dt.name as dough_name 
        //     FROM products p 
        //     LEFT JOIN dough_types dt ON p.dough_id = dt.id
        // `);
        // res.json(rows);
        
        res.json([]);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

module.exports = router;
