import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_BASE = 'http://localhost:8181';

describe('Recipes API', () => {
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

    it('GET /api/recipes returns 200 with auth', async () => {
        const res = await fetch(`${API_BASE}/api/recipes`, {
            headers: { Cookie: adminCookies.join('; ') },
        });
        expect(res.status).toBe(200);
    });

    it('GET /api/recipes without auth returns 401', async () => {
        const res = await fetch(`${API_BASE}/api/recipes`);
        expect(res.status).toBe(401);
    });

    it('GET /api/recipes/:id/versions returns 200 with auth', async () => {
        const listRes = await fetch(`${API_BASE}/api/recipes`, {
            headers: { Cookie: adminCookies.join('; ') },
        });
        const recipes = await listRes.json();
        if (recipes.length > 0) {
            const id = recipes[0].id;
            const versionsRes = await fetch(`${API_BASE}/api/recipes/${id}/versions`, {
                headers: { Cookie: adminCookies.join('; ') },
            });
            expect(versionsRes.status).toBe(200);
        }
    });
});