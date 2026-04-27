import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:8181';

describe('Records API', () => {
    let server;
    let cookies = [];

    beforeAll(async () => {
        const { startServer } = require('./setup');
        server = await startServer();
        // Login as admin to get session
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' }),
        });
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            cookies = setCookie.split(',').map(c => c.split(';')[0]);
        }
    });

    afterAll(async () => {
        const { stopServer } = require('./setup');
        await stopServer(server);
    });

    it('GET /api/records returns 200 with auth', async () => {
        const res = await fetch(`${API_BASE}/api/records`, {
            headers: { Cookie: cookies.join('; ') },
        });
        expect(res.status).toBe(200);
    });

    it('GET /api/records without auth returns 401', async () => {
        const res = await fetch(`${API_BASE}/api/records`);
        expect(res.status).toBe(401);
    });

    it('POST /api/records as admin returns 200 or 400 (validation)', async () => {
        const res = await fetch(`${API_BASE}/api/records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Cookie: cookies.join('; ') },
            body: JSON.stringify({ batch_number: 'TEST001', dough_name: 'Test Dough' }),
        });
        // May succeed or fail validation - just check it's not 401/403
        expect([200, 400]).toContain(res.status);
    });
});