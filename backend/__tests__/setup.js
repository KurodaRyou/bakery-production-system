// Test setup helper - starts server for integration tests
// Usage: import { startServer, stopServer } from './setup';
// In beforeAll: server = await startServer();
// In afterAll: await stopServer();

let server = null;

export async function startServer() {
    // Start server.js as child process on a test port
    const { spawn } = require('child_process');
    const serverProcess = spawn('node', ['server.js'], {
        cwd: __dirname + '/..',
        env: { ...process.env, PORT: '8181' },
        stdio: ['pipe', 'pipe', 'pipe']
    });

    return new Promise((resolve, reject) => {
        serverProcess.stdout.on('data', (data) => {
            if (data.toString().includes('Server running')) {
                resolve(serverProcess);
            }
        });
        serverProcess.stderr.on('data', (data) => {
            console.error('Server error:', data.toString());
        });
        setTimeout(() => reject(new Error('Server start timeout')), 10000);
    });
}

export async function stopServer(serverProcess) {
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
    }
}
