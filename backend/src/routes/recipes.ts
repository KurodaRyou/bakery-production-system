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
import {
  getTimezone,
  compareVersions,
  generateVersionNumber,
} from '../config/versioning';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { AppError } from '../types/errors';
import { createRecipeSchema, updateRecipeSchema } from '../validators/recipes';
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

function toNumber(val: string | number | null | undefined, defaultVal: number): number {
  if (val === null || val === undefined) return defaultVal;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultVal : parsed;
  }
  return defaultVal;
}

function toNullableString(val: string | null | undefined): string | null {
  if (val === null || val === undefined) return null;
  return val;
}

export interface Recipe {
  id: number;
  name: string;
  author: string | null;
  material_id: number | null;
  current_version: string | null;
  created_at: string | null;
  updated_at: string | null;
  timezone: string | null;
  material_name: string | null;
  material_type: string | null;
}

export interface RecipeIngredient {
  id?: number;
  material_id: number | null;
  stage: string;
  percentage: number | null;
  note: string | null;
  unit: string | null;
  material_name: string | null;
  material_type: string | null;
  loss_rate?: number | null;
}

export interface RecipeDetail extends Recipe {
  ingredients: RecipeIngredient[];
  expected_temp: number | null;
}

export interface CreateRecipeRequest {
  name: string;
  type: 'dough' | 'preparation';
  author?: string | null;
  ingredients?: Array<{
    material_id: number | string;
    stage?: string;
    percentage?: number | string | null;
    note?: string | null;
    unit?: string | null;
    loss_rate?: number | string | null;
  }>;
  expected_temp?: number | string | null;
  loss_rate?: number | string | null;
}

export interface UpdateRecipeRequest {
  name: string;
  material_id?: number | string;
  author?: string | null;
  ingredients?: Array<{
    material_id: number | string;
    stage?: string;
    percentage?: number | string | null;
    note?: string | null;
    unit?: string | null;
    loss_rate?: number | string | null;
  }>;
  expected_temp?: number | string | null;
  loss_rate?: number | string;
  description?: string | null;
}

export interface CreateRecipeResponse {
  success: boolean;
  id: number;
  material_id: number | null;
  related_id: number | null;
  version: string;
}

export interface UpdateRecipeResponse {
  success: boolean;
  version: string;
}

export interface RestoreResponse {
  success: boolean;
  version: string;
}

export interface VersionInfo {
  id: number;
  recipe_id: number;
  version_number: string;
  expected_temp: number | null;
  created_at: string | null;
  timezone: string | null;
}

export interface RecipeVersion extends VersionInfo {
  ingredients: RecipeIngredient[];
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

@Route('recipes')
export class RecipesController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listRecipes(): Promise<Recipe[]> {
    const [recipes]: any = await pool.query(
      `SELECT r.id, r.name, r.author, r.material_id, r.current_version,
              r.created_at, r.updated_at, r.timezone, m.name as material_name, m.type as material_type
       FROM dough_recipes r
       LEFT JOIN materials m ON r.material_id = m.id
       ORDER BY r.id DESC`,
    );
    return recipes;
  }

  @Get('{id}')
  @Middlewares(requireAuth)
  public async getRecipe(
    @Path() id: number,
    @Request() req: express.Request,
  ): Promise<RecipeDetail> {
    if (isNaN(id)) {
      throw AppError.badRequest('无效的配方ID');
    }

    const [recipes]: any = await pool.query(
      `SELECT r.id, r.name, r.author, r.material_id, r.current_version,
              r.created_at, r.updated_at, r.timezone,
              m.name as material_name, m.type as material_type
       FROM dough_recipes r
       LEFT JOIN materials m ON r.material_id = m.id
       WHERE r.id = ?`,
      [id],
    );

    if (recipes.length === 0) {
      throw AppError.notFound('Recipe not found');
    }

    const [ingredients]: any = await pool.query(
      `SELECT ric.id, ric.material_id, ric.stage, ric.percentage, ric.note, ric.unit,
              m.name as material_name, m.type as material_type
       FROM dough_recipe_ingredients_current ric
       LEFT JOIN materials m ON ric.material_id = m.id
       WHERE ric.recipe_id = ? AND ric.version = ?
       ORDER BY ric.stage, ric.id`,
      [id, recipes[0].current_version],
    );

    const [versionInfo]: any = await pool.query(
      'SELECT expected_temp FROM dough_recipe_versions WHERE recipe_id = ? AND version_number = ?',
      [id, recipes[0].current_version],
    );

    let result: RecipeDetail = {
      ...recipes[0],
      ingredients,
      expected_temp: versionInfo[0]?.expected_temp || null,
    };

    if (!req.session!.canViewRecipes) {
      result = {
        ...recipes[0],
        ingredients: ingredients.map((ing: RecipeIngredient) => ({
          ...ing,
          material_name: '******',
          note: '******',
        })),
        expected_temp: versionInfo[0]?.expected_temp || null,
      };
    }

    return result;
  }

  @Post()
  @Middlewares(requireAdmin, createValidateMiddleware(createRecipeSchema))
  public async createRecipe(
    @Body() body: CreateRecipeRequest,
  ): Promise<CreateRecipeResponse> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { name, type, author, ingredients, expected_temp } = body;

      if (!type || !['dough', 'preparation'].includes(type)) {
        throw AppError.badRequest('type must be dough or preparation');
      }

      const [existingMaterials]: any = await connection.query(
        'SELECT id FROM materials WHERE name = ? AND type = ?',
        [name, type],
      );

      let materialId: number;
      if (existingMaterials.length > 0) {
        materialId = existingMaterials[0].id;
      } else {
        const [materialResult]: any = await connection.query(
          'INSERT INTO materials (name, type) VALUES (?, ?)',
          [name, type],
        );
        materialId = materialResult.insertId;
      }

      const versionNumber = await generateVersionNumber(connection, null);

      let relatedId: number | null = null;
      if (type === 'dough') {
        const [existingDoughs]: any = await connection.query(
          'SELECT id FROM doughs WHERE material_id = ?',
          [materialId],
        );
        if (existingDoughs.length > 0) {
          relatedId = existingDoughs[0].id;
        } else {
          const [doughResult]: any = await connection.query(
            'INSERT INTO doughs (name, material_id) VALUES (?, ?)',
            [name, materialId],
          );
          relatedId = doughResult.insertId;
        }
      } else if (type === 'preparation') {
        const [existingPreps]: any = await connection.query(
          'SELECT id FROM preparation_recipes WHERE material_id = ?',
          [materialId],
        );
        if (existingPreps.length > 0) {
          relatedId = existingPreps[0].id;
        } else {
          const [prepResult]: any = await connection.query(
            'INSERT INTO preparation_recipes (name, material_id, author) VALUES (?, ?, ?)',
            [name, materialId, author || null],
          );
          relatedId = prepResult.insertId;
        }
      }

      const [result]: any = await connection.query(
        'INSERT INTO dough_recipes (name, material_id, author, current_version) VALUES (?, ?, ?, ?)',
        [name, materialId, author || null, versionNumber],
      );
      const recipeId = result.insertId;

      await connection.query(
        'INSERT INTO dough_recipe_versions (recipe_id, version_number, expected_temp, timezone) VALUES (?, ?, ?, ?)',
        [recipeId, versionNumber, toNumber(expected_temp, null), getTimezone()],
      );

      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          await connection.query(
            'INSERT INTO dough_recipe_ingredients_current (recipe_id, version, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              recipeId,
              versionNumber,
              toNumber(ing.material_id, 0),
              ing.stage || 'base',
              toNumber(ing.percentage, null),
              toNullableString(ing.note),
              toNullableString(ing.unit),
              toNumber(ing.loss_rate, 1),
            ],
          );
        }
      }

      await connection.commit();
      return {
        success: true,
        id: recipeId,
        material_id: materialId,
        related_id: relatedId,
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
  @Middlewares(requireAdmin, createValidateMiddleware(updateRecipeSchema))
  public async updateRecipe(
    @Path() id: number,
    @Body() body: UpdateRecipeRequest,
  ): Promise<UpdateRecipeResponse> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { name, author, ingredients, expected_temp } = body;

      const forbidden = ['id', 'created_at', 'updated_at', 'current_version'];
      for (const key of Object.keys(body)) {
        if (forbidden.includes(key)) {
          throw AppError.badRequest(`字段 ${key} 不可修改`);
        }
      }

      const [recipeRows]: any = await connection.query(
        'SELECT current_version FROM dough_recipes WHERE id = ?',
        [id],
      );
      if (recipeRows.length === 0) {
        throw AppError.notFound('Recipe not found');
      }
      const currentVersion = recipeRows[0].current_version;

      const [currentIngredients]: any = await connection.query(
        'SELECT material_id, stage, percentage, note, unit, loss_rate FROM dough_recipe_ingredients_current WHERE recipe_id = ? AND version = ?',
        [id, currentVersion],
      );

      const normalize = (arr: any[]) => {
        return arr.map(item => ({
          material_id: item.material_id,
          stage: item.stage || 'base',
          percentage: parseFloat(item.percentage) || 0,
          note: item.note || '',
          unit: item.unit || '',
          loss_rate: parseFloat(item.loss_rate) || 1,
        })).sort((a, b) => a.material_id - b.material_id || a.stage.localeCompare(b.stage));
      };

      const normalizedCurrent = normalize(currentIngredients);
      const normalizedNew = normalize(ingredients || []);

      const isEqual = JSON.stringify(normalizedCurrent) === JSON.stringify(normalizedNew);

      if (isEqual) {
        await connection.commit();
        return { success: true, version: currentVersion };
      }

      const newVersion = await generateVersionNumber(connection, id);

      const [versionResult]: any = await connection.query(
        'INSERT INTO dough_recipe_versions (recipe_id, version_number, expected_temp, timezone) VALUES (?, ?, ?, ?)',
        [id, newVersion, expected_temp || null, getTimezone()],
      );
      const versionId = versionResult.insertId;

      for (const ing of currentIngredients) {
        await connection.query(
          'INSERT INTO dough_recipe_ingredients_archive (version_id, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [versionId, ing.material_id, ing.stage, ing.percentage, ing.note, ing.unit, ing.loss_rate || 1],
        );
      }

      await connection.query(
        'UPDATE dough_recipes SET name = ?, author = ?, current_version = ? WHERE id = ?',
        [name, author || null, newVersion, id],
      );

      await connection.query(
        'DELETE FROM dough_recipe_ingredients_current WHERE recipe_id = ? AND version = ?',
        [id, currentVersion],
      );

      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          await connection.query(
            'INSERT INTO dough_recipe_ingredients_current (recipe_id, version, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              id,
              newVersion,
              toNumber(ing.material_id, 0),
              ing.stage || 'base',
              toNumber(ing.percentage, null),
              toNullableString(ing.note),
              toNullableString(ing.unit),
              toNumber(ing.loss_rate, 1),
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
  public async deleteRecipe(@Path() id: number): Promise<{ success: boolean }> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (isNaN(id)) {
        throw AppError.badRequest('无效的配方ID');
      }

      const [recipe]: any = await connection.query(
        'SELECT material_id FROM dough_recipes WHERE id = ?',
        [id],
      );
      const materialId = recipe.length > 0 ? recipe[0].material_id : null;

      const [versions]: any = await connection.query(
        'SELECT id FROM dough_recipe_versions WHERE recipe_id = ?',
        [id],
      );
      for (const v of versions) {
        await connection.query(
          'DELETE FROM dough_recipe_ingredients_archive WHERE version_id = ?',
          [v.id],
        );
      }
      await connection.query(
        'DELETE FROM dough_recipe_versions WHERE recipe_id = ?',
        [id],
      );
      await connection.query(
        'DELETE FROM dough_recipe_ingredients_current WHERE recipe_id = ?',
        [id],
      );
      await connection.query('DELETE FROM dough_recipes WHERE id = ?', [id]);
      await deleteMaterialIfOrphaned(connection, materialId);

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
  public async listVersions(@Path() id: number): Promise<VersionInfo[]> {
    if (isNaN(id)) {
      throw AppError.badRequest('无效的配方ID');
    }

    const [versions]: any = await pool.query(
      'SELECT id, recipe_id, version_number, expected_temp, created_at, timezone FROM dough_recipe_versions WHERE recipe_id = ?',
      [id],
    );
    versions.sort((a: VersionInfo, b: VersionInfo) =>
      compareVersions(b.version_number, a.version_number),
    );
    return versions;
  }

  @Get('{id}/versions/{versionNumber}')
  @Middlewares(requireAuth)
  public async getVersion(
    @Path() id: number,
    @Path() versionNumber: string,
    @Request() req: express.Request,
  ): Promise<RecipeVersion> {
    if (isNaN(id) || !versionNumber) {
      throw AppError.badRequest('无效的ID或版本号');
    }

    const [versions]: any = await pool.query(
      'SELECT * FROM dough_recipe_versions WHERE recipe_id = ? AND version_number = ?',
      [id, versionNumber],
    );
    if (versions.length === 0) {
      throw AppError.notFound('Version not found');
    }

    const [ingredients]: any = await pool.query(
      `SELECT a.stage, a.material_id, a.percentage, a.note, a.unit, a.loss_rate,
              m.name as material_name, m.type as material_type
       FROM dough_recipe_ingredients_archive a
       LEFT JOIN materials m ON a.material_id = m.id
       WHERE a.version_id = ? ORDER BY a.stage, a.id`,
      [versions[0].id],
    );

    let result: RecipeVersion = { ...versions[0], ingredients };

    if (!req.session!.canViewRecipes) {
      result = {
        ...versions[0],
        ingredients: ingredients.map((ing: RecipeIngredient) => ({
          ...ing,
          material_name: '******',
          note: '******',
        })),
      };
    }

    return result;
  }

  @Post('{id}/restore/{versionNumber}')
  @Middlewares(requireAdmin)
  public async restoreVersion(
    @Path() id: number,
    @Path() versionNumber: string,
  ): Promise<RestoreResponse> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (isNaN(id)) {
        throw AppError.badRequest('无效的配方ID');
      }

      const [versions]: any = await connection.query(
        'SELECT * FROM dough_recipe_versions WHERE recipe_id = ? AND version_number = ?',
        [id, versionNumber],
      );
      if (versions.length === 0) {
        throw AppError.notFound('Version not found');
      }
      const versionToRestore = versions[0];

      const [recipeRows]: any = await connection.query(
        'SELECT current_version FROM dough_recipes WHERE id = ?',
        [id],
      );
      const currentVersion = recipeRows[0].current_version;
      const newVersion = await generateVersionNumber(connection, id);

      await connection.query(
        'INSERT INTO dough_recipe_versions (recipe_id, version_number, expected_temp, timezone) VALUES (?, ?, ?, ?)',
        [id, newVersion, versionToRestore.expected_temp || null, getTimezone()],
      );

      await connection.query(
        'DELETE FROM dough_recipe_ingredients_current WHERE recipe_id = ? AND version = ?',
        [id, currentVersion],
      );

      const [archivedIngredients]: any = await connection.query(
        'SELECT material_id, stage, percentage, note, unit FROM dough_recipe_ingredients_archive WHERE version_id = ?',
        [versionToRestore.id],
      );

      for (const ing of archivedIngredients) {
        await connection.query(
          'INSERT INTO dough_recipe_ingredients_current (recipe_id, version, material_id, stage, percentage, note, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, newVersion, ing.material_id, ing.stage, ing.percentage, ing.note, ing.unit],
        );
      }

      await connection.query(
        'UPDATE dough_recipes SET current_version = ? WHERE id = ?',
        [newVersion, id],
      );

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
}
