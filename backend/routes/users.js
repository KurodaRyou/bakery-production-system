const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sessions } = require('../middleware/session');
const bcrypt = require('bcrypt');
const { getTimezone } = require('../config/versioning');

// GET /api/users
router.get('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, name, role, can_view_recipes, created_at, timezone FROM users ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// POST /api/users
router.post('/', requireAuth, async (req, res) => {
    if (req.session.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can create users' });
    }
    try {
        const { username, password, role, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, name, password, role, timezone) VALUES (?, ?, ?, ?, ?)',
            [username, name || null, hashedPassword, role || 'staff', getTimezone()]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// PUT /api/users/:id
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role, can_view_recipes, name } = req.body;

        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的用户ID' });
        }

        await pool.query('UPDATE users SET role = ?, can_view_recipes = ?, name = ? WHERE id = ?', [role, can_view_recipes ? 1 : 0, name || null, id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// DELETE /api/users/:id
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: '无效的用户ID' });
        }
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

module.exports = router;
