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

      const refs = await findMaterialRecipeRefs(connection, [materialId]);
      if (refs.has(materialId)) {
        const err = new Error('该原材料正在被配方使用，无法删除。请先从下列配方中移除该材料后再试。') as any;
        err.statusCode = 409;
        err.customResponse = {
          error: 'material_in_use',
          message: '该原材料正在被配方使用，无法删除。请先从下列配方中移除该材料后再试。',
          references: refs.get(materialId)
        };
        err._skipCatch = true;
        throw err;
      }

      await connection.beginTransaction();
      await connection.query('DELETE FROM ingredients WHERE id = ?', [id]);
      await deleteMaterialIfOrphaned(connection, materialId);
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      const e = error as any;
      if (e._skipCatch) throw error;
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
      const [rows]: any = await connection.query('SELECT id, name FROM materials WHERE id = ?', [id]);
      if (rows.length === 0) {
        throw AppError.notFound('物料不存在');
      }

      const refs = await findMaterialRecipeRefs(connection, [id]);
      if (refs.has(id)) {
        const err = new Error('该原材料正在被配方使用，无法删除。请先从下列配方中移除该材料后再试。') as any;
        err.statusCode = 409;
        err.customResponse = {
          error: 'material_in_use',
          message: '该原材料正在被配方使用，无法删除。请先从下列配方中移除该材料后再试。',
          references: refs.get(id)
        };
err._skipCatch = true;
        throw err;
      }

      await connection.query('DELETE FROM ingredients WHERE material_id = ?', [id]);
      await connection.query('DELETE FROM materials WHERE id = ?', [id]);
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      const e = error as any;
      if (e._skipCatch) {
        throw error;
      }
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    } finally {
      connection.release();
    }
  }

  @Post('batch-delete')
  @Middlewares(requireAdmin)
  public async batchDeleteMaterials(@Body() body: { ids: number[] }): Promise<any> {
    const connection = await pool.getConnection();
    try {
      const { ids } = body;
      if (!Array.isArray(ids) || ids.length === 0) {
        throw AppError.badRequest('ids must be a non-empty array');
      }

      const refs = await findMaterialRecipeRefs(connection, ids);

      const [materials]: any = await connection.query(
        'SELECT id, name FROM materials WHERE id IN (' + ids.map(() => '?').join(',') + ')',
        ids
      );

      const failedDeletions: any[] = [];
      const safeToDelete: any[] = [];

      for (const m of materials) {
        if (refs.has(m.id)) {
          failedDeletions.push({ materialId: m.id, materialName: m.name, recipes: refs.get(m.id) });
        } else {
          safeToDelete.push(m);
        }
      }

      if (failedDeletions.length > 0) {
        const err = new Error('部分原材料正在被配方使用，无法删除。请先从下列配方中移除对应材料后再试。') as any;
        err.statusCode = 409;
        err.customResponse = {
          error: 'materials_in_use',
          message: '部分原材料正在被配方使用，无法删除。请先从下列配方中移除对应材料后再试。',
          failedDeletions
        };
        err._skipCatch = true;
        throw err;
      }

      await connection.beginTransaction();
      await connection.query(
        'DELETE FROM ingredients WHERE material_id IN (' + safeToDelete.map(() => '?').join(',') + ')',
        safeToDelete.map((m: any) => m.id)
      );
      await connection.query(
        'DELETE FROM materials WHERE id IN (' + safeToDelete.map(() => '?').join(',') + ')',
        safeToDelete.map((m: any) => m.id)
      );
      await connection.commit();

      return {
        deleted: safeToDelete.length,
        deletedMaterials: safeToDelete.map((m: any) => ({ id: m.id, name: m.name }))
      };
    } catch (error) {
      await connection.rollback();
      const e = error as any;
      if (e._skipCatch) throw error;
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    } finally {
      connection.release();
    }
  }
}

async function findMaterialRecipeRefs(connection: any, materialIds: number[]): Promise<Map<number, any[]>> {
  const result = new Map();
  if (!materialIds || materialIds.length === 0) return result;

  const placeholders = materialIds.map(() => '?').join(',');

  const [doughRefs]: any = await connection.query(`
    SELECT di.material_id, d.id, d.name, d.current_version as version
    FROM dough_ingredients_current di
    JOIN doughs d ON d.id = di.dough_id
    WHERE di.material_id IN (${placeholders})
  `, materialIds);

  const [prepRefs]: any = await connection.query(`
    SELECT pi.material_id, p.id, p.name, p.current_version as version
    FROM preparation_ingredients_current pi
    JOIN preparations p ON p.id = pi.preparation_id
    WHERE pi.material_id IN (${placeholders})
  `, materialIds);

  for (const row of doughRefs) {
    if (!result.has(row.material_id)) result.set(row.material_id, []);
    result.get(row.material_id).push({ type: 'dough', id: row.id, name: row.name, version: row.version });
  }
  for (const row of prepRefs) {
    if (!result.has(row.material_id)) result.set(row.material_id, []);
    result.get(row.material_id).push({ type: 'preparation', id: row.id, name: row.name, version: row.version });
  }

  return result;
}
