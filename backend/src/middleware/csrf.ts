import { Request, Response, NextFunction } from 'express';
import { doubleCsrf, DoubleCsrfUtilities } from 'csrf-csrf';
import { AppError } from '../types/errors';

const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret-change-in-production-min-32-chars!';
const CSRF_COOKIE_NAME = 'csrfToken';
const CSRF_HEADER_NAME = 'x-csrf-token';

const csrfUtils: DoubleCsrfUtilities = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  getSessionIdentifier: (req) => req.ip || req.connection.remoteAddress || 'anonymous',
  cookieName: CSRF_COOKIE_NAME,
  cookieOptions: {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/',
  },
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers[CSRF_HEADER_NAME] as string | undefined,
  errorConfig: {
    statusCode: 403,
    message: '无效的 CSRF token',
    code: 'CSRF_ERROR',
  },
});

export function createCsrfToken(req: Request, res: Response): string {
  return csrfUtils.generateCsrfToken(req, res, {
    cookieOptions: {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
    },
  });
}

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    return next();
  }

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  if (req.path.startsWith('/auth/login')) {
    return next();
  }

  csrfUtils.doubleCsrfProtection(req, res, (err?: any) => {
    if (err) {
      return next(AppError.forbidden('无效的 CSRF token'));
    }
    next();
  });
}