const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { sessions, SESSION_EXPIRY_MS } = require('../middleware/session');
const { getSession, requireAuth, checkLoginAttempts, recordLoginAttempt } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const { username, password } = req.body;

        if (!checkLoginAttempts(clientIp, username)) {
            return res.status(429).json({ error: '登录尝试次数过多，请15分钟后再试' });
        }

        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        if (users.length === 0) {
            recordLoginAttempt(clientIp, username, false);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            recordLoginAttempt(clientIp, username, false);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        recordLoginAttempt(clientIp, username, true);
        const token = crypto.randomBytes(32).toString('hex');
        sessions.set(token, {
            userId: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            canViewRecipes: user.can_view_recipes === 1,
            createdAt: Date.now()
        });
        const isHttps = req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https';
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: isHttps,
            sameSite: 'lax',
            maxAge: SESSION_EXPIRY_MS
        });
        res.json({ username: user.username, name: user.name, role: user.role, canViewRecipes: user.can_view_recipes === 1 });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    const token = req.headers['authorization'] || req.cookies?.authToken;
    if (token) {
        sessions.delete(token);
    }
    res.clearCookie('authToken');
    res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, name, role, can_view_recipes, created_at, timezone FROM users WHERE id = ?',
            [req.session.userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = rows[0];
        res.json({
            userId: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            canViewRecipes: user.can_view_recipes === 1
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { username, password } = req.body;
        const userId = req.session.userId;

        if (username) {
            await pool.query('UPDATE users SET username = ? WHERE id = ?', [username, userId]);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
            for (const [token, session] of sessions) {
                if (session.userId === userId) {
                    sessions.delete(token);
                }
            }
            return res.json({ success: true, loggedOut: true });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

module.exports = router;