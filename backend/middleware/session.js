const fs = require('fs');
const SESSION_FILE = '/tmp/bakery-sessions.json';
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function loadSessions() {
    try {
        const data = fs.readFileSync(SESSION_FILE, 'utf8');
        const parsed = JSON.parse(data);
        // Convert plain object to Map
        return new Map(Object.entries(parsed));
    } catch (e) {
        return new Map();
    }
}

function saveSessions(sessionsMap) {
    const obj = Object.fromEntries(sessionsMap);
    fs.writeFileSync(SESSION_FILE, JSON.stringify(obj));
}

// Load sessions from file
let sessions = loadSessions();

// Clean up expired sessions on startup
const now = Date.now();
for (const [token, session] of sessions) {
    if (now - session.createdAt > SESSION_EXPIRY_MS) {
        sessions.delete(token);
    }
}
saveSessions(sessions);

// Wrap set to auto-save
const originalSet = sessions.set.bind(sessions);
sessions.set = function(...args) {
    const result = originalSet(...args);
    saveSessions(sessions);
    return result;
};

// Wrap delete to auto-save
const originalDelete = sessions.delete.bind(sessions);
sessions.delete = function(...args) {
    const result = originalDelete(...args);
    saveSessions(sessions);
    return result;
};

// Periodic cleanup of expired sessions
setInterval(() => {
    const now = Date.now();
    for (const [token, session] of sessions) {
        if (now - session.createdAt > SESSION_EXPIRY_MS) {
            sessions.delete(token);
        }
    }
}, 60 * 60 * 1000);

module.exports = { sessions, SESSION_EXPIRY_MS, loadSessions, saveSessions };
