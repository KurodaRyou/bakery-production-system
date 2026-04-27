import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

interface RateLimitRequest extends Request {
    rateLimit?: {
        limit: number;
        used: number;
        remaining: number;
        resetTime: Date;
    };
}

const EXEMPT_PATHS = ['/health', '/api-docs'];

function isExempt(req: Request): boolean {
    return EXEMPT_PATHS.some((path) => req.path.startsWith(path));
}

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: isExempt,
    handler: (req: RateLimitRequest, res: Response) => {
        const resetTime = req.rateLimit?.resetTime?.getTime() ?? Date.now();
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        res.set('Retry-After', String(retryAfter));
        res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    },
    message: { error: '请求过于频繁，请稍后再试' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: RateLimitRequest, res: Response) => {
        const resetTime = req.rateLimit?.resetTime?.getTime() ?? Date.now();
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        res.set('Retry-After', String(retryAfter));
        res.status(429).json({ error: '登录尝试次数过多，请15分钟后再试' });
    },
    message: { error: '登录尝试次数过多，请15分钟后再试' },
});

export { globalLimiter, authLimiter };
