import {
  Route,
  Get,
  Controller,
  Middlewares,
} from '@tsoa/runtime';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../types/errors';

declare global {
  namespace Express {
    interface Request {
      session?: {
        userId: number;
        username: string;
        name: string;
        role: string;
        canViewRecipes: boolean;
        createdAt: number;
      };
    }
  }
}

export interface Product {
  id: number;
  name: string;
  dough_id?: number;
  other_ingredients?: unknown;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

@Route('products')
export class ProductsController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listProducts(): Promise<Product[]> {
    throw new AppError('NOT_IMPLEMENTED', {
      message: '待实现：需要先完善数据结构',
      statusCode: 501,
    });
  }
}
