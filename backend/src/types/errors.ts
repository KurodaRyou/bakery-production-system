export interface AppErrorOptions {
  message?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, options: AppErrorOptions = {}) {
    super(options.message || code);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = options.statusCode || 500;
    this.details = options.details;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  static notFound(message = '资源不存在'): AppError {
    return new AppError('NOT_FOUND', { message, statusCode: 404 });
  }

  static badRequest(message = '请求参数错误'): AppError {
    return new AppError('BAD_REQUEST', { message, statusCode: 400 });
  }

  static unauthorized(message = '未授权访问'): AppError {
    return new AppError('UNAUTHORIZED', { message, statusCode: 401 });
  }

  static forbidden(message = '权限不足'): AppError {
    return new AppError('FORBIDDEN', { message, statusCode: 403 });
  }

  static internal(message = '服务器内部错误'): AppError {
    return new AppError('INTERNAL_ERROR', { message, statusCode: 500 });
  }
}
