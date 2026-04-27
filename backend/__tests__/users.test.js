import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:8181';

describe('Users API', () => {
    let server;
    let adminCookies = [];

    beforeAll(async () => {
        const { startServer } = require('./setup');
        server = await startServer();
        const adminRes = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' }),
        });
        const adminSetCookie = adminRes.headers.get('set-cookie');
        if (adminSetCookie) {
            adminCookies = adminSetCookie.split(',').map(c => c.split(';')[0]);
        }
    });

    afterAll(async () => {
        const { stopServer } = require('./setup');
        await stopServer(server);
    });

    it('GET /api/users returns 200 with admin auth', async () => {
        const res = await fetch(`${API_BASE}/api/users`, {
            headers: { Cookie: adminCookies.join('; ') },
        });
        expect(res.status).toBe(200);
    });

    it('GET /api/machines returns 200 (no auth required)', async () => {
        const res = await fetch(`${API_BASE}/api/machines`);
        expect(res.status).toBe(200);
    });

    it('GET /api/dough-types returns 200 (no auth required)', async () => {
        const res = await fetch(`${API_BASE}/api/dough-types`);
        expect(res.status).toBe(200);
    });
});