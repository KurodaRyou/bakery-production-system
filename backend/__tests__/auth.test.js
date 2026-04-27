import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:8181';

describe('Auth API', () => {
    let server;

    beforeAll(async () => {
        const { startServer } = require('./setup');
        server = await startServer();
    });

    afterAll(async () => {
        const { stopServer } = require('./setup');
        await stopServer(server);
    });

    it('login with valid credentials returns 200', async () => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: 'test' }),
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.username).toBe('test');
    });

    it('login with invalid password returns 401', async () => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: 'wrongpassword' }),
        });
        expect(res.status).toBe(401);
    });

    it('GET /api/auth/me without auth returns 401', async () => {
        const res = await fetch(`${API_BASE}/api/auth/me`);
        expect(res.status).toBe(401);
    });
});
