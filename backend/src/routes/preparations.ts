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
import { deleteMaterialIfOrphaned } from '../config/deleteMaterialIfOrphaned';
import { generateVersionNumber } from '../config/versioning';
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
  loss_rate?: number | null;
  material_name: string | null;
  material_type: string | null;
}

export interface Preparation {
  id: number;
  name: string;
  author: string | null;
  material_id: number | null;
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
  author?: string | null;
  description?: string | null;
  loss_rate?: number | string | null;
  ingredients?: Array<{
    material_id: number | string;
    stage?: string;
    percentage?: number | string | null;
    note?: string | null;
    unit?: string | null;
    loss_rate?: number | string | null;
  }>;
}

export interface CreatePreparationResponse {
  id: number;
  material_id: number;
  name: string;
  version: string;
}

export interface UpdatePreparationRequest {
  name: string;
  author?: string | null;
  loss_rate?: number | string | null;
  ingredients?: Array<{
    material_id: number | string;
    stage?: string;
    percentage?: number | string | null;
    note?: string | null;
    unit?: string | null;
    loss_rate?: number | string | null;
  }>;
}

export interface UpdatePreparationResponse {
  success: boolean;
  version: string;
}

export interface PreparationVersion {
  id: number;
  preparation_id: number;
  version_number: string;
  created_at: string | null;
  
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


@Route('preparations')
export class PreparationsController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listPreparations(): Promise<Preparation[]> {
    const [rows]: any = await pool.query(
      `SELECT pr.id, pr.name, pr.author, pr.material_id, pr.current_version, pr.loss_rate,
              pr.created_at, pr.updated_at, m.name as material_name, m.type as material_type,
              pv.version_number, pv.created_at as version_created_at,
              pic.id as pi_id, pic.material_id as pi_material_id, pic.percentage, pic.stage, pic.note, pic.unit, pic.loss_rate as pi_loss_rate,
              mp.name as pi_material_name, mp.type as pi_material_type
       FROM preparations pr
       LEFT JOIN materials m ON pr.material_id = m.id
       LEFT JOIN preparation_versions pv ON pr.id = pv.preparation_id AND pv.version_number = pr.current_version
       LEFT JOIN preparation_ingredients_current pic ON pr.id = pic.preparation_id AND pic.version = pr.current_version
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
          loss_rate: row.pi_loss_rate,
          material_name: row.pi_material_name,
          material_type: row.pi_material_type,
        });
      }
    }

    return Array.from(recipesMap.values());
  }

  @Get('by-material/{materialId}')
  @Middlewares(requireAuth)
  public async getPreparationByMaterial(
    @Path() materialId: number,
    @Request() req: express.Request,
  ): Promise<Preparation> {
    if (isNaN(materialId)) {
      throw AppError.badRequest('无效的 material ID');
    }

    const [recipes]: any = await pool.query(
      `SELECT pr.id, pr.name, pr.author, pr.material_id, pr.current_version, pr.loss_rate,
              pr.created_at, pr.updated_at, m.name as material_name, m.type as material_type
       FROM preparations pr
       LEFT JOIN materials m ON pr.material_id = m.id
       WHERE pr.material_id = ?`,
      [materialId],
    );

    if (recipes.length === 0) {
      throw AppError.notFound('Preparation not found');
    }

    const recipe = recipes[0];

    const ingredientsQuery = recipe.current_version
      ? `SELECT pic.id, pic.material_id, pic.stage, pic.percentage, pic.note, pic.unit, pic.loss_rate,
                m.name as material_name, m.type as material_type
         FROM preparation_ingredients_current pic
         LEFT JOIN materials m ON pic.material_id = m.id
         WHERE pic.preparation_id = ? AND pic.version = ?`
      : `SELECT pic.id, pic.material_id, pic.stage, pic.percentage, pic.note, pic.unit, pic.loss_rate,
                m.name as material_name, m.type as material_type
         FROM preparation_ingredients_current pic
         LEFT JOIN materials m ON pic.material_id = m.id
         WHERE pic.preparation_id = ?`;
    const ingredientParams = recipe.current_version ? [recipe.id, recipe.current_version] : [recipe.id];
    const [ingredients]: any = await pool.query(ingredientsQuery, ingredientParams);

    if (!req.session!.canViewRecipes) {
      recipe.ingredients = ingredients.map((ing: any) => ({
        ...ing,
        material_name: '******',
        note: '******',
      }));
    } else {
      recipe.ingredients = ingredients;
    }

    return recipe;
  }

  @Get('{id}')
  @Middlewares(requireAuth)
  public async getPreparation(
    @Path() id: number,
    @Request() req: express.Request,
  ): Promise<Preparation> {
    if (isNaN(id)) {
      throw AppError.badRequest('无效的半成品ID');
    }

    const [recipes]: any = await pool.query(
      `SELECT pr.id, pr.name, pr.author, pr.material_id, pr.current_version, pr.loss_rate,
              pr.created_at, pr.updated_at, m.name as material_name, m.type as material_type
       FROM preparations pr
       LEFT JOIN materials m ON pr.material_id = m.id
       WHERE pr.id = ?`,
      [id],
    );

    if (recipes.length === 0) {
      throw AppError.notFound('Preparation not found');
    }

    const recipe = recipes[0];

    const ingredientsQuery = recipe.current_version
      ? `SELECT pic.id, pic.material_id, pic.stage, pic.percentage, pic.note, pic.unit, pic.loss_rate,
                m.name as material_name, m.type as material_type
         FROM preparation_ingredients_current pic
         LEFT JOIN materials m ON pic.material_id = m.id
         WHERE pic.preparation_id = ? AND pic.version = ?`
      : `SELECT pic.id, pic.material_id, pic.stage, pic.percentage, pic.note, pic.unit, pic.loss_rate,
                m.name as material_name, m.type as material_type
         FROM preparation_ingredients_current pic
         LEFT JOIN materials m ON pic.material_id = m.id
         WHERE pic.preparation_id = ?`;
    const ingredientParams = recipe.current_version ? [id, recipe.current_version] : [id];
    const [ingredients]: any = await pool.query(ingredientsQuery, ingredientParams);

    if (!req.session!.canViewRecipes) {
      recipe.ingredients = ingredients.map((ing: any) => ({
        ...ing,
        material_name: '******',
        note: '******',
      }));
    } else {
      recipe.ingredients = ingredients;
    }

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

      const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '');
      const versionNumber = `v${today}01`;

      const [result]: any = await connection.query(
        'INSERT INTO preparations (name, material_id, author, current_version, loss_rate) VALUES (?, ?, ?, ?, ?)',
        [name, materialId, author || null, versionNumber, loss_rate || 1],
      );
      const recipeId = result.insertId;

      await connection.query(
        'INSERT INTO preparation_versions (preparation_id, version_number, author) VALUES (?, ?, ?)',
        [recipeId, versionNumber, author || null],
      );

      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          await connection.query(
            'INSERT INTO preparation_ingredients_current (preparation_id, version, material_id, percentage, stage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              recipeId,
              versionNumber,
              ing.material_id,
              ing.percentage || null,
              ing.stage || 'base',
              ing.note || null,
              ing.unit || null,
              ing.loss_rate || 1,
            ],
          );
        }
      }

      await connection.commit();
      return {
        id: recipeId,
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

      const forbidden = ['id', 'created_at', 'updated_at', 'current_version'];
      for (const key of Object.keys(body)) {
        if (forbidden.includes(key)) {
          throw AppError.badRequest(`字段 ${key} 不可修改`);
        }
      }

      await connection.beginTransaction();

      const [existing]: any = await connection.query(
        'SELECT current_version FROM preparations WHERE id = ?',
        [id],
      );

      if (existing.length === 0) {
        throw AppError.notFound('Preparation not found');
      }

      const currentVersion = existing[0].current_version;

      const [currentIngredients]: any = await connection.query(
        'SELECT material_id, stage, percentage, note, unit, loss_rate FROM preparation_ingredients_current WHERE preparation_id = ? AND version = ?',
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

      const today = new Date().toLocaleDateString('en-CA').replace(/-/g, '');
      const prefix = `v${today}`;

      const [versionRows]: any = await connection.query(
        'SELECT version_number FROM preparation_versions WHERE preparation_id = ? AND version_number LIKE ?',
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
        'SELECT material_id FROM preparations WHERE id = ?',
        [id],
      );

      await connection.query(
        'UPDATE preparations SET name = ?, author = ?, current_version = ?, loss_rate = ? WHERE id = ?',
        [name, author || null, newVersion, loss_rate || 1, id],
      );

      if (currentIngredients.length > 0) {
        const [versionInfo]: any = await connection.query(
          'SELECT id FROM preparation_versions WHERE preparation_id = ? AND version_number = ?',
          [id, currentVersion],
        );
        if (versionInfo.length > 0) {
          for (const ing of currentIngredients) {
            await connection.query(
              'INSERT INTO preparation_ingredients_archive (version_id, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [
                versionInfo[0].id,
                ing.material_id,
                ing.stage,
                ing.percentage,
                ing.note,
                ing.unit,
                ing.loss_rate || 1,
              ],
            );
          }
        }
      }

      await connection.query(
        'DELETE FROM preparation_ingredients_current WHERE preparation_id = ? AND version = ?',
        [id, currentVersion],
      );

      await connection.query(
        'INSERT INTO preparation_versions (preparation_id, version_number, author) VALUES (?, ?, ?)',
        [id, newVersion, author || null],
      );

      if (ingredients && ingredients.length > 0) {
        for (const ing of ingredients) {
          await connection.query(
            'INSERT INTO preparation_ingredients_current (preparation_id, version, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
              id,
              newVersion,
              ing.material_id,
              ing.stage || 'base',
              ing.percentage || null,
              ing.note || null,
              ing.unit || null,
              ing.loss_rate || 1,
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
        'SELECT material_id FROM preparations WHERE id = ?',
        [id],
      );
      const materialId = recipe.length > 0 ? recipe[0].material_id : null;

      const [versions]: any = await connection.query(
        'SELECT id FROM preparation_versions WHERE preparation_id = ?',
        [id],
      );
      for (const v of versions) {
        await connection.query(
          'DELETE FROM preparation_ingredients_archive WHERE version_id = ?',
          [v.id],
        );
      }
      await connection.query(
        'DELETE FROM preparation_versions WHERE preparation_id = ?',
        [id],
      );
      await connection.query(
        'DELETE FROM preparation_ingredients_current WHERE preparation_id = ?',
        [id],
      );
      await connection.query(
        'DELETE FROM preparations WHERE id = ?',
        [id],
      );
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
  public async listVersions(
    @Path() id: number,
  ): Promise<PreparationVersion[]> {
    if (isNaN(id)) {
      throw AppError.badRequest('无效的半成品ID');
    }

    const [versions]: any = await pool.query(
      'SELECT id, preparation_id, version_number, created_at FROM preparation_versions WHERE preparation_id = ? ORDER BY created_at DESC',
      [id],
    );
    return versions;
  }

  @Get('{id}/versions/{version}')
  @Middlewares(requireAuth)
  public async getVersion(
    @Path() id: number,
    @Path() version: string,
    @Request() req: express.Request,
  ): Promise<PreparationVersionIngredient[]> {
    if (isNaN(id) || !version) {
      throw AppError.badRequest('无效的ID或版本号');
    }

    const [ingredients]: any = await pool.query(
      `SELECT pia.id, pia.material_id, pia.stage, pia.percentage, pia.note, pia.unit, pia.loss_rate,
              m.name as material_name, m.type as material_type
       FROM preparation_ingredients_archive pia
       LEFT JOIN materials m ON pia.material_id = m.id
       WHERE pia.version_id IN (SELECT id FROM preparation_versions WHERE preparation_id = ? AND version_number = ?)
       ORDER BY pia.stage, pia.id`,
      [id, version],
    );

    if (!req.session!.canViewRecipes) {
      return ingredients.map((ing: any) => ({
        ...ing,
        material_name: '******',
        note: '******',
      }));
    }

    return ingredients;
  }

  @Post('{id}/restore/{version}')
  @Middlewares(requireAdmin)
  public async restoreVersion(
    @Path() id: number,
    @Path() version: string,
  ): Promise<{ success: boolean; version: string }> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (isNaN(id)) {
        throw AppError.badRequest('无效的半成品ID');
      }

      const [versions]: any = await connection.query(
        'SELECT * FROM preparation_versions WHERE preparation_id = ? AND version_number = ?',
        [id, version],
      );
      if (versions.length === 0) {
        throw AppError.notFound('Version not found');
      }
      const versionToRestore = versions[0];

      const [recipeRows]: any = await connection.query(
        'SELECT current_version FROM preparations WHERE id = ?',
        [id],
      );
      const currentVersion = recipeRows[0].current_version;

      const newVersion = await generateVersionNumber(connection, id, 'preparation_versions', 'preparation_id');

      // Archive current ingredients before replacing them
      const [currentIngredients]: any = await connection.query(
        'SELECT material_id, stage, percentage, note, unit, loss_rate FROM preparation_ingredients_current WHERE preparation_id = ? AND version = ?',
        [id, currentVersion],
      );
      if (currentIngredients.length > 0) {
        const [versionInfo]: any = await connection.query(
          'SELECT id FROM preparation_versions WHERE preparation_id = ? AND version_number = ?',
          [id, currentVersion],
        );
        if (versionInfo.length > 0) {
          for (const ing of currentIngredients) {
            await connection.query(
              'INSERT INTO preparation_ingredients_archive (version_id, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [versionInfo[0].id, ing.material_id, ing.stage, ing.percentage, ing.note, ing.unit, ing.loss_rate || 1],
            );
          }
        }
      }

      await connection.query(
        'INSERT INTO preparation_versions (preparation_id, version_number, author) VALUES (?, ?, ?)',
        [id, newVersion, versionToRestore.author || null],
      );

      await connection.query(
        'DELETE FROM preparation_ingredients_current WHERE preparation_id = ? AND version = ?',
        [id, currentVersion],
      );

      const [archivedIngredients]: any = await connection.query(
        'SELECT material_id, stage, percentage, note, unit, loss_rate FROM preparation_ingredients_archive WHERE version_id = ?',
        [versionToRestore.id],
      );

      for (const ing of archivedIngredients) {
        await connection.query(
          'INSERT INTO preparation_ingredients_current (preparation_id, version, material_id, stage, percentage, note, unit, loss_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, newVersion, ing.material_id, ing.stage, ing.percentage, ing.note, ing.unit, ing.loss_rate || 1],
        );
      }

      await connection.query(
        'UPDATE preparations SET current_version = ?, author = ? WHERE id = ?',
        [newVersion, versionToRestore.author || null, id],
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
