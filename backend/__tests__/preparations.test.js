import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:8181';

describe('Preparations API', () => {
    let server;
    let adminCookies = [];
    let staffCookies = [];

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

        const staffRes = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: 'test' }),
        });
        const staffSetCookie = staffRes.headers.get('set-cookie');
        if (staffSetCookie) {
            staffCookies = staffSetCookie.split(',').map(c => c.split(';')[0]);
        }
    });

    afterAll(async () => {
        const { stopServer } = require('./setup');
        await stopServer(server);
    });

    it('GET /api/preparations returns 200 with auth', async () => {
        const res = await fetch(`${API_BASE}/api/preparations`, {
            headers: { Cookie: adminCookies.join('; ') },
        });
        expect(res.status).toBe(200);
    });

    it('GET /api/preparations without auth returns 401', async () => {
        const res = await fetch(`${API_BASE}/api/preparations`);
        expect(res.status).toBe(401);
    });
});