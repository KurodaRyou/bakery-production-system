import {
  Route,
  Get,
  Post,
  Put,
  Delete,
  Controller,
  Body,
  Path,
  Middlewares,
} from '@tsoa/runtime';
import { pool } from '../config/db';
import { deleteMaterialIfOrphaned } from '../config/deleteMaterialIfOrphaned';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { AppError } from '../types/errors';
import { createMaterialSchema, updateMaterialSchema } from '../validators/materials';
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

export interface Material {
  id: number;
  name: string;
  type: string;
  created_at: string | null;
}

export interface CreateMaterialRequest {
  name: string;
  type: string;
}

export interface Ingredient {
  id: number;
  name: string;
  material_id?: number;
  type: string;
  default_unit: string | null;
  manufacturer: string | null;
  spec: string | null;
  price: number | null;
}

export interface CreateIngredientRequest {
  name: string;
  type?: string;
  default_unit?: string;
  manufacturer?: string;
  spec?: string;
  price?: number;
}


@Route('ingredients')
export class IngredientsController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listIngredients(): Promise<Ingredient[]> {
    const [rows]: any = await pool.query('SELECT * FROM ingredients ORDER BY name');
    return rows;
  }

  @Post()
  @Middlewares(requireAdmin)
  public async createIngredient(
    @Body() body: CreateIngredientRequest,
  ): Promise<Ingredient & { material_id: number }> {
    const connection = await pool.getConnection();
    try {
      const { name, type, default_unit, manufacturer, spec, price } = body;
      if (!name) {
        throw AppError.badRequest('Ingredient name is required');
      }

      await connection.beginTransaction();

      const [materialResult]: any = await connection.query(
        'INSERT INTO materials (name, type) VALUES (?, ?)',
        [name, 'ingredient'],
      );
      const materialId = materialResult.insertId;

      const [result]: any = await connection.query(
        'INSERT INTO ingredients (name, material_id, type, default_unit, manufacturer, spec, price) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE material_id = VALUES(material_id), type = VALUES(type), default_unit = VALUES(default_unit), manufacturer = VALUES(manufacturer), spec = VALUES(spec), price = VALUES(price)',
        [name, materialId, type || 'additive', default_unit || '%', manufacturer || null, spec || null, price || null],
      );

      await connection.commit();
      return {
        id: result.insertId,
        material_id: materialId,
        name,
        type: type || 'additive',
        default_unit: default_unit || '%',
        manufacturer: manufacturer || null,
        spec: spec || null,
        price: price || null,
      };
    } catch (error) {
      await connection.rollback();
      console.error('DB error:', error);
      throw AppError.internal('服务器内部错误');
    } finally {
      connection.release();
    }
  }

  @Put('{id}')
  @Middlewares(requireAdmin)
  public async updateIngredient(
    @Path() id: number,
    @Body() body: CreateIngredientRequest,
  ): Promise<Ingredient> {
    try {
      const { name, type, default_unit, manufacturer, spec, price } = body;
      if (!name) {
        throw AppError.badRequest('Ingredient name is required');
      }
      await pool.query(
        'UPDATE ingredients SET name = ?, type = ?, default_unit = ?, manufacturer = ?, spec = ?, price = ? WHERE id = ?',
        [name, type || 'others', default_unit || '%', manufacturer || null, spec || null, price || null, id],
      );
      return {
        id,
        name,
        type: type || 'others',
        default_unit: default_unit || '%',
        manufacturer: manufacturer || null,
        spec: spec || null,
        price: price || null,
      };
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }

  @Delete('{id}')
  @Middlewares(requireAdmin)
  public async deleteIngredient(@Path() id: number): Promise<{ success: boolean }> {
    const connection = await pool.getConnection();
    try {
      const [rows]: any = await connection.query('SELECT material_id FROM ingredients WHERE id = ?', [id]);
      if (rows.length === 0) {
        throw AppError.notFound('原材料不存在');
      }
      const materialId = rows[0].material_id;
      await connection.beginTransaction();
      await connection.query('DELETE FROM ingredients WHERE id = ?', [id]);
      await deleteMaterialIfOrphaned(connection, materialId);
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    } finally {
      connection.release();
    }
  }
}

@Route('materials')
export class MaterialsController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listMaterials(): Promise<Material[]> {
    const [rows]: any = await pool.query('SELECT * FROM materials ORDER BY type, name');
    return rows;
  }

  @Post()
  @Middlewares(requireAdmin, createValidateMiddleware(createMaterialSchema))
  public async createMaterial(
    @Body() body: CreateMaterialRequest,
  ): Promise<Material> {
    try {
      const { name, type } = body;
      if (!name || !type) {
        throw AppError.badRequest('name and type are required');
      }
      const [result]: any = await pool.query(
        'INSERT INTO materials (name, type) VALUES (?, ?)',
        [name, type],
      );
      return { id: result.insertId, name, type, created_at: null };
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }

  @Put('{id}')
  @Middlewares(requireAdmin, createValidateMiddleware(updateMaterialSchema))
  public async updateMaterial(
    @Path() id: number,
    @Body() body: CreateMaterialRequest,
  ): Promise<Material> {
    try {
      const { name, type } = body;
      if (!name || !type) {
        throw AppError.badRequest('name and type are required');
      }
      await pool.query(
        'UPDATE materials SET name = ?, type = ? WHERE id = ?',
        [name, type, id],
      );
      return { id, name, type, created_at: null };
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }

  @Delete('{id}')
  @Middlewares(requireAdmin)
  public async deleteMaterial(@Path() id: number): Promise<{ success: boolean }> {
    const connection = await pool.getConnection();
    try {
      const [rows]: any = await connection.query('SELECT id FROM materials WHERE id = ?', [id]);
      if (rows.length === 0) {
        throw AppError.notFound('物料不存在');
      }
      await connection.beginTransaction();
      await deleteMaterialIfOrphaned(connection, id);
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    } finally {
      connection.release();
    }
  }
}
