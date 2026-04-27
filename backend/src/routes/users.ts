import {
  Route,
  Get,
  Post,
  Put,
  Delete,
  Controller,
  Body,
  Path,
  Request,
  Middlewares,
} from '@tsoa/runtime';
import express from 'express';
import { pool } from '../config/db';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { getTimezone } from '../config/versioning';
import bcrypt from 'bcrypt';
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

export interface User {
  id: number;
  username: string;
  name: string | null;
  role: string;
  can_view_recipes: number;
  created_at: string | null;
  timezone: string | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role?: string;
  name?: string;
}

export interface UpdateUserRequest {
  role: string;
  can_view_recipes: number;
  name?: string;
}

@Route('users')
export class UsersController extends Controller {
  @Get()
  @Middlewares(requireAuth, requireAdmin)
  public async listUsers(): Promise<User[]> {
    try {
      const [rows]: any = await pool.query(
        'SELECT id, username, name, role, can_view_recipes, created_at, timezone FROM users ORDER BY id',
      );
      return rows;
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }

  @Post()
  @Middlewares(requireAuth)
  public async createUser(
    @Body() body: CreateUserRequest,
    @Request() req: express.Request,
  ): Promise<{ success: boolean }> {
    if (req.session!.role !== 'admin') {
      throw AppError.forbidden('Only admin can create users');
    }
    try {
      const { username, password, role, name } = body;
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (username, name, password, role, timezone) VALUES (?, ?, ?, ?, ?)',
        [username, name || null, hashedPassword, role || 'staff', getTimezone()],
      );
      return { success: true };
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }

  @Put('{id}')
  @Middlewares(requireAuth, requireAdmin)
  public async updateUser(
    @Path() id: number,
    @Body() body: UpdateUserRequest,
  ): Promise<{ success: boolean }> {
    try {
      if (isNaN(id)) {
        throw AppError.badRequest('无效的用户ID');
      }
      const { role, can_view_recipes, name } = body;
      await pool.query(
        'UPDATE users SET role = ?, can_view_recipes = ?, name = ? WHERE id = ?',
        [role, can_view_recipes ? 1 : 0, name || null, id],
      );
      return { success: true };
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }

  @Delete('{id}')
  @Middlewares(requireAuth, requireAdmin)
  public async deleteUser(@Path() id: number): Promise<{ success: boolean }> {
    try {
      if (isNaN(id)) {
        throw AppError.badRequest('无效的用户ID');
      }
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return { success: true };
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }
}
