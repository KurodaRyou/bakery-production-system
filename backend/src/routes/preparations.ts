import {
  Route,
  Get,
  Post,
  Put,
  Delete,
  Controller,
  Body,
  Request,
  Path,
  Middlewares,
} from '@tsoa/runtime';
import express from 'express';
import { pool } from '../config/db';
import { getTimezone } from '../config/versioning';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { AppError } from '../types/errors';
import { createPreparationSchema, updatePreparationSchema } from '../validators/preparations';
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

export interface PreparationIngredient {
  id?: number;
  material_id: number | null;
  percentage: number | null;
  stage: string | null;
  note: string | null;
  unit: string | null;
  material_name: string | null;
  material_type: string | null;
}

export interface Preparation {
  id: number;
  name: string;
  author: string | null;
  material_id: number | null;
  preparation_id: number | null;
  current_version: string | null;
  loss_rate: number | null;
  created_at: string | null;
  updated_at: string | null;
  material_name: string | null;
  material_type: string | null;
  version: string | null;
  ingredients: PreparationIngredient[];
}

export interface PreparationRecipe extends Preparation {}

export interface CreatePreparationRequest {
  name: string;
  author?: string;
  description?: string;
  loss_rate?: number;
  ingredients?: Array<{
    material_id: number;
    stage?: string;
    percentage?: number;
    note?: string;
    unit?: string;
  }>;
}

export interface CreatePreparationResponse {
  id: number;
  preparation_id: number;
  material_id: number;
  name: string;
  version: string;
}

export interface UpdatePreparationRequest {
  name: string;
  author?: string;
  loss_rate?: number;
  ingredients?: Array<{
    material_id: number;
    stage?: string;
    percentage?: number;
    note?: string;
    unit?: string;
  }>;
}

export interface UpdatePreparationResponse {
  success: boolean;
  version: string;
}

export interface PreparationVersion {
  id: number;
  recipe_id: number;
  version_number: string;
  created_at: string | null;
  timezone: string | null;
}

export interface PreparationVersionIngredient {
  id: number;
  material_id: number | null;
  stage: string | null;
  percentage: number | null;
  note: string | null;
  unit: string | null;
  loss_rate: number | null;
  material_name: string | null;
  material_type: string | null;
}

async function deleteMaterialIfOrphaned(
  connection: any,
  materialId: number | null,
) {
  if (!materialId) return;
  const [refs]: any = await connection.query(
    `SELECT 1 FROM ingredients WHERE material_id = ? UNION ALL
     SELECT 1 FROM dough_recipes WHERE material_id = ? UNION ALL
     SELECT 1 FROM preparation_recipes WHERE material_id = ? UNION ALL
     SELECT 1 FROM dough_recipe_ingredients_current WHERE material_id = ? UNION ALL
     SELECT 1 FROM preparation_ingredients_current WHERE material_id = ?`,
    [materialId, materialId, materialId, materialId, materialId],
  );
  if (refs.length === 0) {
    await connection.query('DELETE FROM materials WHERE id = ?', [materialId]);
  }
}

@Route('preparations')
export class PreparationsController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listPreparations(): Promise<Preparation[]> {
    const [rows]: any = await pool.query(
      `SELECT pr.id, pr.name, pr.author, pr.material_id, pr.preparation_id, pr.current_version, pr.loss_rate,
              pr.created_at, pr.updated_at, m.name as material_name, m.type as material_type,
              pv.version_number, pv.created_at as version_created_at,
              pic.id as pi_id, pic.material_id as pi_material_id, pic.percentage, pic.stage, pic.note, pic.unit,
              mp.name as pi_material_name, mp.type as pi_material_type
       FROM preparation_recipes pr
       LEFT JOIN materials m ON pr.material_id = m.id
       LEFT JOIN preparation_versions pv ON pr.id = pv.recipe_id AND pv.version_number = pr.current_version
       LEFT JOIN preparation_ingredients_current pic ON pr.id = pic.preparation_recipe_id AND pic.version = pr.current_version
       LEFT JOIN materials mp ON pic.material_id = mp.id
       ORDER BY pr.id DESC`,
    );

    const recipesMap = new Map<number, Preparation>();
    for (const row of rows) {
      if (!recipesMap.has(row.id)) {
        recipesMap.set(row.id, {
          id: row.id,
          name: row.name,
          author: row.author,
          material_id: row.material_id,
          preparation_id: row.preparation_id,
          current_version: row.current_version,
          loss_rate: row.loss_rate,
          created_at: row.created_at,
          updated_at: row.updated_at,
          material_name: row.material_name,
          material_type: row.material_type,
          version: row.version_number || row.current_version,
          ingredients: [],
        });
      }
      if (row.pi_id) {
        recipesMap.get(row.id)!.ingredients.push({
          id: row.pi_id,
          material_id: row.pi_material_id,
          percentage: row.percentage,
          stage: row.stage,
          note: row.note,
          unit: row.unit,
          material_name: row.pi_material_name,
          material_type: row.pi_material_type,
        });
      }
    }

    return Array.from(recipesMap.values());
  }

  @Get('{id}')
  @Middlewares(requireAuth)
  public async getPreparation(@Path() id: number): Promise<Preparation> {
    if (isNaN(id)) {
      throw AppError.badRequest('无效的半成品ID');
    }

    const [recipes]: any = await pool.query(
      `SELECT pr.id, pr.name, pr.author, pr.material_id, pr.preparation_id, pr.current_version, pr.loss_rate,
              pr.created_at, pr.updated_at, m.name as material_name, m.type as material_type
       FROM preparation_recipes pr
       LEFT JOIN materials m ON pr.material_id = m.id
       WHERE pr.id = ?`,
      [id],
    );

    if (recipes.length === 0) {
      throw AppError.notFound('Preparation not found');
    }

    const recipe = recipes[0];

    const [ingredients]: any = await pool.query(
      `SELECT pic.id, pic.material_id, pic.stage, pic.percentage, pic.note, pic.unit,
              m.name as material_name, m.type as material_type
       FROM preparation_ingredients_current pic
       LEFT JOIN materials m ON pic.material_id = m.id
       WHERE pic.preparation_recipe_id = ? AND pic.version = ?`,
      [id, recipe.current_version],
    );

    recipe.ingredients = ingredients;
    return recipe;
  }

  @Post()
  @Middlewares(requireAdmin, createValidateMiddleware(createPreparationSchema))
  public async createPreparation(
    @Body() body: CreatePreparationRequest,
  ): Promise<CreatePreparationResponse> {
    const connection = await pool.getConnection();
    try {
      const { name, author, ingredients, description, loss_rate } = body;
      if (!name) {
        throw AppError.badRequest('名称不能为空');
      }

      await connection.beginTransaction();

      const [materialResult]: any = await connection.query(
        'INSERT INTO materials (name, type) VALUES (?, ?)',
        [name, 'preparation'],
      );
      const materialId = materialResult.insertId;

      const [existing]: any = await connection.query(
        'SELECT id FROM preparations WHERE name = ?',
        [name],
      );
      let preparationId: number;
      if (existing.length > 0) {
        preparationId = existing[0].id;
        await connection.query(
          'UPDATE preparations SET material_id = ? WHERE id = ?',
          [materialId, preparationId],
        );
      } else {
        const [prepResult]: any = await connection.query(
          'INSERT INTO preparations (name, material_id, description) VALUES (?, ?, ?)',
          [name, materialId, description || null],
        );
        preparationId = prepResult.insertId;
      }

      const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '');
      const versionNumber = `v${today}01`;

      const [result]: any = await connection.query(
        'INSERT INTO preparation_recipes (name, preparation_id, material_id, author, current_version, loss_rate) VALUES (?, ?, ?, ?, ?, ?)',
        [name, preparationId, materialId, author || null, versionNumber, loss_rate || 1],
      );
      const recipeId = result.insertId;

      await connection.query(
        'INSERT INTO preparation_versions (recipe_id, version_number, timezone) VALUES (?, ?, ?)',
        [recipeId, versionNumber, getTimezone()],
      );

      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          await connection.query(
            'INSERT INTO preparation_ingredients_current (preparation_recipe_id, version, material_id, stage, percentage, note, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              recipeId,
              versionNumber,
              ing.material_id,
              ing.stage || 'base',
              ing.percentage || null,
              ing.note || null,
              ing.unit || null,
            ],
          );
        }
      }

      await connection.commit();
      return {
        id: recipeId,
        preparation_id: preparationId,
        material_id: materialId,
        name,
        version: versionNumber,
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
  @Middlewares(requireAdmin, createValidateMiddleware(updatePreparationSchema))
  public async updatePreparation(
    @Path() id: number,
    @Body() body: UpdatePreparationRequest,
  ): Promise<UpdatePreparationResponse> {
    const connection = await pool.getConnection();
    try {
      const { name, author, ingredients, loss_rate } = body;

      if (isNaN(id)) {
        throw AppError.badRequest('无效的半成品ID');
      }

      await connection.beginTransaction();

      const [existing]: any = await connection.query(
        'SELECT current_version FROM preparation_recipes WHERE id = ?',
        [id],
      );

      if (existing.length === 0) {
        throw AppError.notFound('Preparation not found');
      }

      const currentVersion = existing[0].current_version;

      const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '');
      const prefix = `v${today}`;

      const [versionRows]: any = await connection.query(
        'SELECT version_number FROM preparation_versions WHERE recipe_id = ? AND version_number LIKE ?',
        [id, `${prefix}%`],
      );

      let newVersion: string;
      if (versionRows.length === 0) {
        newVersion = `${prefix}01`;
      } else {
        const suffixes = versionRows.map((r: any) => {
          const match = r.version_number.match(/^v\d{8}(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        });
        newVersion = `${prefix}${String(Math.max(...suffixes) + 1).padStart(2, '0')}`;
      }

      const [recipeInfo]: any = await connection.query(
        'SELECT preparation_id, material_id FROM preparation_recipes WHERE id = ?',
        [id],
      );
      const preparationId = recipeInfo[0]?.preparation_id;

      await connection.query(
        'UPDATE preparation_recipes SET name = ?, author = ?, current_version = ?, loss_rate = ? WHERE id = ?',
        [name, author || null, newVersion, loss_rate || 1, id],
      );

      if (preparationId && name) {
        await connection.query(
          'UPDATE preparations SET name = ? WHERE id = ?',
          [name, preparationId],
        );
      }

      const [archiveIngredients]: any = await connection.query(
        'SELECT material_id, stage, percentage, note, unit FROM preparation_ingredients_current WHERE preparation_recipe_id = ? AND version = ?',
        [id, currentVersion],
      );

      if (archiveIngredients.length > 0) {
        const [versionInfo]: any = await connection.query(
          'SELECT id FROM preparation_versions WHERE recipe_id = ? AND version_number = ?',
          [id, currentVersion],
        );
        if (versionInfo.length > 0) {
          for (const ing of archiveIngredients) {
            await connection.query(
              'INSERT INTO preparation_ingredients_archive (version_id, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [
                versionInfo[0].id,
                ing.material_id,
                ing.stage,
                ing.percentage,
                ing.note,
                ing.unit,
                null,
              ],
            );
          }
        }
      }

      await connection.query(
        'DELETE FROM preparation_ingredients_current WHERE preparation_recipe_id = ? AND version = ?',
        [id, currentVersion],
      );

      await connection.query(
        'INSERT INTO preparation_versions (recipe_id, version_number, timezone) VALUES (?, ?, ?)',
        [id, newVersion, getTimezone()],
      );

      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          await connection.query(
            'INSERT INTO preparation_ingredients_current (preparation_recipe_id, version, material_id, stage, percentage, note, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              id,
              newVersion,
              ing.material_id,
              ing.stage || 'base',
              ing.percentage || null,
              ing.note || null,
              ing.unit || null,
            ],
          );
        }
      }

      await connection.commit();
      return { success: true, version: newVersion };
    } catch (error) {
      await connection.rollback();
      console.error('DB error:', error);
      throw AppError.internal('服务器内部错误');
    } finally {
      connection.release();
    }
  }

  @Delete('{id}')
  @Middlewares(requireAdmin)
  public async deletePreparation(
    @Path() id: number,
  ): Promise<{ success: boolean }> {
    const connection = await pool.getConnection();
    try {
      if (isNaN(id)) {
        throw AppError.badRequest('无效的半成品ID');
      }

      await connection.beginTransaction();

      const [recipe]: any = await connection.query(
        'SELECT material_id, preparation_id FROM preparation_recipes WHERE id = ?',
        [id],
      );
      const materialId = recipe.length > 0 ? recipe[0].material_id : null;
      const preparationId = recipe.length > 0 ? recipe[0].preparation_id : null;

      const [versions]: any = await connection.query(
        'SELECT id FROM preparation_versions WHERE recipe_id = ?',
        [id],
      );
      for (const v of versions) {
        await connection.query(
          'DELETE FROM preparation_ingredients_archive WHERE version_id = ?',
          [v.id],
        );
      }
      await connection.query(
        'DELETE FROM preparation_versions WHERE recipe_id = ?',
        [id],
      );
      await connection.query(
        'DELETE FROM preparation_ingredients_current WHERE preparation_recipe_id = ?',
        [id],
      );
      await connection.query(
        'DELETE FROM preparation_recipes WHERE id = ?',
        [id],
      );
      await deleteMaterialIfOrphaned(connection, materialId);

      if (preparationId) {
        const [refs]: any = await connection.query(
          'SELECT 1 FROM preparation_recipes WHERE preparation_id = ?',
          [preparationId],
        );
        if (refs.length === 0) {
          await connection.query(
            'DELETE FROM preparations WHERE id = ?',
            [preparationId],
          );
        }
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('DB error:', error);
      throw AppError.internal('服务器内部错误');
    } finally {
      connection.release();
    }
  }

  @Get('{id}/versions')
  @Middlewares(requireAuth)
  public async listVersions(
    @Path() id: number,
  ): Promise<PreparationVersion[]> {
    if (isNaN(id)) {
      throw AppError.badRequest('无效的半成品ID');
    }

    const [versions]: any = await pool.query(
      'SELECT id, recipe_id, version_number, created_at, timezone FROM preparation_versions WHERE recipe_id = ? ORDER BY created_at DESC',
      [id],
    );
    return versions;
  }

  @Get('{id}/versions/{version}')
  @Middlewares(requireAuth)
  public async getVersion(
    @Path() id: number,
    @Path() version: string,
  ): Promise<PreparationVersionIngredient[]> {
    if (isNaN(id) || !version) {
      throw AppError.badRequest('无效的ID或版本号');
    }

    const [ingredients]: any = await pool.query(
      `SELECT pia.id, pia.material_id, pia.stage, pia.percentage, pia.note, pia.unit, pia.loss_rate,
              m.name as material_name, m.type as material_type
       FROM preparation_ingredients_archive pia
       LEFT JOIN materials m ON pia.material_id = m.id
       WHERE pia.version_id IN (SELECT id FROM preparation_versions WHERE recipe_id = ? AND version_number = ?)
       ORDER BY pia.stage, pia.id`,
      [id, version],
    );
    return ingredients;
  }
}
