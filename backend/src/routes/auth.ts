import {
  Route,
  Post,
  Get,
  Put,
  Controller,
  Body,
  Request,
  Middlewares,
} from '@tsoa/runtime';
import express from 'express';
import { pool } from '../config/db';
import { sessions, SESSION_EXPIRY_MS } from '../middleware/session';
import {
  getSession,
  requireAuth,
  checkLoginAttempts,
  recordLoginAttempt,
} from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppError } from '../types/errors';
import { loginSchema, updateProfileSchema } from '../validators/auth';
import { createValidateMiddleware } from '../middleware/validate';

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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserProfile {
  userId: number;
  username: string;
  name: string;
  role: string;
  canViewRecipes: boolean;
}

export interface AuthResponse {
  username: string;
  name: string;
  role: string;
  canViewRecipes: boolean;
}

export interface UpdateProfileRequest {
  username?: string;
  password?: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  loggedOut?: boolean;
}

@Route('auth')
export class AuthController extends Controller {
  @Post('login')
  @Middlewares(authLimiter, createValidateMiddleware(loginSchema))
  public async login(
    @Body() body: LoginRequest,
    @Request() req: express.Request,
  ): Promise<AuthResponse> {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const { username, password } = body;

    if (!checkLoginAttempts(clientIp, username)) {
      throw AppError.unauthorized('登录尝试次数过多，请15分钟后再试');
    }

    const [users]: any = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
    );

    if (users.length === 0) {
      recordLoginAttempt(clientIp, username, false);
      throw AppError.unauthorized('Invalid credentials');
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      recordLoginAttempt(clientIp, username, false);
      throw AppError.unauthorized('Invalid credentials');
    }

    recordLoginAttempt(clientIp, username, true);

    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      canViewRecipes: user.can_view_recipes === 1,
      createdAt: Date.now(),
    });

    const isHttps =
      req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https';

    req.res!.cookie('authToken', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_MS,
    });

    return {
      username: user.username,
      name: user.name,
      role: user.role,
      canViewRecipes: user.can_view_recipes === 1,
    };
  }

  @Post('logout')
  public async logout(
    @Request() req: express.Request,
  ): Promise<{ success: boolean }> {
    const token = req.headers['authorization'] || req.cookies?.authToken;
    if (token) {
      sessions.delete(token);
    }
    req.res!.clearCookie('authToken');
    return { success: true };
  }

  @Get('me')
  @Middlewares(requireAuth)
  public async me(
    @Request() req: express.Request,
  ): Promise<UserProfile> {
    const [rows]: any = await pool.query(
      'SELECT id, username, name, role, can_view_recipes, created_at, timezone FROM users WHERE id = ?',
      [req.session!.userId],
    );

    if (rows.length === 0) {
      throw AppError.notFound('User not found');
    }

    const user = rows[0];
    return {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      canViewRecipes: user.can_view_recipes === 1,
    };
  }

  @Put('profile')
  @Middlewares(requireAuth, createValidateMiddleware(updateProfileSchema))
  public async updateProfile(
    @Body() body: UpdateProfileRequest,
    @Request() req: express.Request,
  ): Promise<ProfileUpdateResponse> {
    const { username, password } = body;
    const userId = req.session!.userId;

    if (username) {
      await pool.query('UPDATE users SET username = ? WHERE id = ?', [
        username,
        userId,
      ]);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [
        hashedPassword,
        userId,
      ]);

      for (const [token, session] of sessions) {
        if (session.userId === userId) {
          sessions.delete(token);
        }
      }

      return { success: true, loggedOut: true };
    }

    return { success: true };
  }
}
