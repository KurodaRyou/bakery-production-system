import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`路径 ${req.originalUrl} 不存在`));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const message = isAppError ? err.message : '服务器内部错误';
  const details = isAppError ? err.details : undefined;

  if (!isAppError) {
    console.error('Unhandled error:', err);
  }

  if (process.env.NODE_ENV === 'development' && !isAppError) {
    console.error(err.stack);
  }

  const body: {
    success: false;
    error: { code: string; message: string; details?: Record<string, unknown> };
    stack?: string;
  } = {
    success: false,
    error: { code, message },
  };

  if (details) {
    body.error.details = details;
  }

  if (process.env.NODE_ENV === 'development' && !isAppError) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
