const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/machines', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM mixing_machines ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

router.get('/dough-types', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM doughs ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

router.get('/preparations-types', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM preparations ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

module.exports = router;
