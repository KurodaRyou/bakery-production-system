import { z } from 'zod';
import { AppError } from '../types/errors';

export function validate(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    schema.parseAsync(req.body)
      .then(parsed => {
        req.body = parsed;
        next();
      })
      .catch(error => {
        if (error instanceof z.ZodError) {
          const details = error.issues.reduce((acc: Record<string, string>, issue) => {
            const path = issue.path.join('.') || 'unknown';
            acc[path] = issue.message;
            return acc;
          }, {});

          next(new AppError('BAD_REQUEST', {
            message: 'Validation failed',
            statusCode: 400,
            details,
          }));
        } else {
          next(error);
        }
      });
  };
}

export const createValidateMiddleware = validate;