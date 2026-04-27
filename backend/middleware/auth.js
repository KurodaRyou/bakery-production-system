const { pool } = require('../config/db');
const { sessions, SESSION_EXPIRY_MS } = require('./session');

const loginAttempts = new Map();
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_MS = 15 * 60 * 1000;

async function getSession(req) {
    const authHeader = req.headers['authorization'];

    if (authHeader?.startsWith('Bearer ')) {
        const apiToken = authHeader.slice(7);
        const [users] = await pool.query(
            'SELECT * FROM users WHERE api_token = ?', [apiToken]
        );
        if (users.length === 0) return null;
        const user = users[0];
        return {
            userId: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            canViewRecipes: user.can_view_recipes === 1,
            createdAt: Date.now()
        };
    }

    const token = authHeader || req.cookies?.authToken;
    if (!token) return null;
    const session = sessions.get(token);
    if (!session) return null;
    if (Date.now() - session.createdAt > SESSION_EXPIRY_MS) {
        sessions.delete(token);
        return null;
    }
    return session;
}

async function requireAuth(req, res, next) {
    const session = await getSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.session = session;
    next();
}

async function requireAdmin(req, res, next) {
    const session = await getSession(req);
    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (session.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    req.session = session;
    next();
}

async function requireApiToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiToken = authHeader.slice(7);
    const [users] = await pool.query(
        'SELECT * FROM users WHERE api_token = ?', [apiToken]
    );

    if (users.length === 0) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = users[0];
    req.session = {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        canViewRecipes: user.can_view_recipes === 1,
        createdAt: Date.now()
    };

    next();
}

function checkLoginAttempts(ip, username) {
    const key = `${ip}:${username}`;
    const attempt = loginAttempts.get(key);
    if (!attempt) return true;
    if (Date.now() - attempt.lastAttempt > LOGIN_LOCKOUT_MS) {
        loginAttempts.delete(key);
        return true;
    }
    if (attempt.count >= LOGIN_MAX_ATTEMPTS) {
        return false;
    }
    return true;
}

function recordLoginAttempt(ip, username, success) {
    const key = `${ip}:${username}`;
    if (success) {
        loginAttempts.delete(key);
        return;
    }
    const attempt = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
    attempt.count++;
    attempt.lastAttempt = Date.now();
    loginAttempts.set(key, attempt);
}

module.exports = {
    getSession,
    requireAuth,
    requireAdmin,
    requireApiToken,
    checkLoginAttempts,
    recordLoginAttempt,
    loginAttempts
};
