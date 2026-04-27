require('dotenv').config();
const crypto = require('crypto');

// SECURITY: Fail fast if MASTER_KEY is not configured - random key would break encryption permanently
if (!process.env.BAKERY_MASTER_KEY) {
    console.error('FATAL: BAKERY_MASTER_KEY environment variable is not set');
    process.exit(1);
}
const MASTER_KEY = process.env.BAKERY_MASTER_KEY;
const ALGORITHM = 'aes-256-gcm';

function encrypt(text) {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(MASTER_KEY, 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

function decrypt(encryptedData) {
    if (!encryptedData) return null;
    try {
        const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
        const authTag = Buffer.from(encryptedData.slice(32, 64), 'hex');
        const encrypted = encryptedData.slice(64);
        const key = Buffer.from(MASTER_KEY, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return null;
    }
}

module.exports = { MASTER_KEY, ALGORITHM, encrypt, decrypt };
