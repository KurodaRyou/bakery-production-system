import {
  Route,
  Get,
  Controller,
} from '@tsoa/runtime';
import { pool } from '../config/db';
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

export interface Machine {
  id: number;
  name: string;
}

export interface DoughType {
  id: number;
  name: string;
  material_id?: number;
  description?: string;
}

export interface PreparationType {
  id: number;
  name: string;
  material_id?: number;
  description?: string;
  created_at?: string;
}

@Route('machines')
export class MachinesController extends Controller {
  @Get()
  public async listMachines(): Promise<Machine[]> {
    try {
      const [rows]: any = await pool.query('SELECT * FROM mixing_machines ORDER BY id');
      return rows;
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }
}

@Route('dough-types')
export class DoughTypesController extends Controller {
  @Get()
  public async listDoughTypes(): Promise<DoughType[]> {
    try {
      const [rows]: any = await pool.query('SELECT * FROM doughs ORDER BY id');
      return rows;
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }
}

@Route('preparations-types')
export class PreparationTypesController extends Controller {
  @Get()
  public async listPreparationTypes(): Promise<PreparationType[]> {
    try {
      const [rows]: any = await pool.query('SELECT * FROM preparations ORDER BY id');
      return rows;
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }
}
