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
  Query,
  Middlewares,
} from '@tsoa/runtime';
import express from 'express';
import { pool } from '../config/db';
import { getTimezone } from '../config/versioning';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../types/errors';
import { createRecordSchema, updateRecordSchema } from '../validators/records';
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

export interface MixingRecord {
  batch_number: string;
  dough_name: string;
  dry_temp: number | null;
  room_temp: number | null;
  ice_ratio: number | null;
  water_temp: number | null;
  flour_amount: number | null;
  water_amount: number | null;
  dough_weight: number | null;
  machine_speed: string | null;
  gluten_level: number | null;
  output_temp: number | null;
  machine: string | null;
  operator: string | null;
  bulk_ferment_temp: number | null;
  bulk_ferment_time: number | null;
  created_at: string | null;
  updated_at: string | null;
  timezone: string | null;
  expected_temp?: number | null;
}

export interface RecordsListResponse {
  records: MixingRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateRecordRequest {
  batch_number: string;
  dough_name: string;
  dry_temp?: number;
  room_temp?: number;
  ice_ratio?: number;
  water_temp?: number;
  flour_amount?: number;
  water_amount?: number;
  machine_speed?: string;
  gluten_level?: number;
  output_temp?: number;
  machine?: string;
  operator?: string;
  bulk_ferment_temp?: number;
  bulk_ferment_time?: number;
}

export interface UpdateRecordRequest {
  dough_name?: string;
  dry_temp?: number;
  room_temp?: number;
  ice_ratio?: number;
  water_temp?: number;
  flour_amount?: number;
  water_amount?: number;
  dough_weight?: number;
  machine_speed?: string;
  gluten_level?: number;
  output_temp?: number;
  machine?: string;
  operator?: string;
  bulk_ferment_temp?: number;
  bulk_ferment_time?: number;
}

@Route('records')
export class RecordsController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listRecords(
    @Query() limit?: number,
    @Query() offset?: number,
  ): Promise<MixingRecord[] | RecordsListResponse> {
    if (limit !== undefined && offset !== undefined) {
      const parsedLimit = Math.min(limit || 100, 500);
      const parsedOffset = offset || 0;
      const [rows]: any = await pool.query(
        'SELECT *, timezone FROM mixing_records ORDER BY batch_number DESC LIMIT ? OFFSET ?',
        [parsedLimit, parsedOffset],
      );
      const [[{ total }]]: any = await pool.query('SELECT COUNT(*) as total FROM mixing_records');
      return { records: rows, total, limit: parsedLimit, offset: parsedOffset };
    }

    const [rows]: any = await pool.query(`
      SELECT r.*, r.timezone, rv.expected_temp
      FROM mixing_records r
      LEFT JOIN doughs rp ON r.dough_name = rp.name
      LEFT JOIN dough_versions rv ON rp.id = rv.recipe_id AND rp.current_version = rv.version_number
      ORDER BY r.batch_number DESC
    `);
    return rows;
  }

  @Post()
  @Middlewares(requireAuth, createValidateMiddleware(createRecordSchema))
  public async createRecord(
    @Body() body: CreateRecordRequest,
    @Request() req: express.Request,
  ): Promise<{ success: boolean }> {
    if (req.session!.role !== 'admin' && req.session!.role !== 'manager') {
      throw AppError.forbidden('仅管理员和主管可新增打面记录');
    }

    const record = body;

    if (!record.batch_number) {
      throw AppError.badRequest('批次号不能为空');
    }
    if (!record.dough_name) {
      throw AppError.badRequest('面团种类不能为空');
    }

    if ('created_at' in record || 'updated_at' in record) {
      throw AppError.badRequest('字段 created_at, updated_at 不可手动设置');
    }

    try {
      const sql = `INSERT INTO mixing_records
        (batch_number, dough_name, dry_temp, room_temp, ice_ratio, water_temp,
         flour_amount, water_amount, machine_speed, gluten_level,
         output_temp, machine, operator, bulk_ferment_temp, bulk_ferment_time, timezone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await pool.query(sql, [
        record.batch_number, record.dough_name, record.dry_temp, record.room_temp,
        record.ice_ratio, record.water_temp, record.flour_amount, record.water_amount,
        record.machine_speed, record.gluten_level, record.output_temp,
        record.machine, record.operator, record.bulk_ferment_temp, record.bulk_ferment_time,
        getTimezone(),
      ]);
      return { success: true };
    } catch (error: any) {
      console.error('Create record error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        throw AppError.badRequest('该批次号已存在');
      }
      if (error.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
        throw AppError.badRequest('数据超出范围，请检查输入值');
      }
      throw AppError.internal('保存失败，请稍后重试');
    }
  }

  @Put('{batchNumber}')
  @Middlewares(requireAuth, createValidateMiddleware(updateRecordSchema))
  public async updateRecord(
    @Path() batchNumber: string,
    @Body() body: UpdateRecordRequest,
    @Request() req: express.Request,
  ): Promise<{ success: boolean }> {
    if (req.session!.role !== 'admin' && req.session!.role !== 'manager') {
      throw AppError.forbidden('仅管理员和主管可编辑打面记录');
    }

    const record = body;

    const protectedFields = ['batch_number', 'created_at', 'updated_at'];
    for (const field of protectedFields) {
      if (field in record) {
        throw AppError.badRequest(`字段 ${field} 不可修改`);
      }
    }

    const allowedFields: Record<string, string> = {
      dough_name: 'dough_name', dry_temp: 'dry_temp', room_temp: 'room_temp',
      ice_ratio: 'ice_ratio', water_temp: 'water_temp', flour_amount: 'flour_amount',
      water_amount: 'water_amount', dough_weight: 'dough_weight', machine_speed: 'machine_speed',
      gluten_level: 'gluten_level', output_temp: 'output_temp', machine: 'machine',
      operator: 'operator', bulk_ferment_temp: 'bulk_ferment_temp', bulk_ferment_time: 'bulk_ferment_time',
    };
    const setClauses = Object.keys(record).filter(k => allowedFields[k]).map(k => `${allowedFields[k]} = ?`);
    const values = Object.keys(record).filter(k => allowedFields[k]).map(k => (record as any)[k]);
    if (setClauses.length === 0) {
      throw AppError.badRequest('没有需要更新的字段');
    }

    try {
      await pool.query(
        `UPDATE mixing_records SET ${setClauses.join(', ')} WHERE batch_number = ?`,
        [...values, batchNumber],
      );
      return { success: true };
    } catch (error: any) {
      console.error('Update record error:', error);
      if (error.code === 'ER_WARN_DATA_OUT_OF_RANGE') {
        throw AppError.badRequest('数据超出范围，请检查输入值');
      }
      throw AppError.internal('保存失败，请稍后重试');
    }
  }

  @Delete('{batchNumber}')
  @Middlewares(requireAuth)
  public async deleteRecord(
    @Path() batchNumber: string,
    @Request() req: express.Request,
  ): Promise<{ success: boolean }> {
    if (req.session!.role !== 'admin' && req.session!.role !== 'manager') {
      throw AppError.forbidden('仅管理员和主管可删除记录');
    }

    try {
      await pool.query('DELETE FROM mixing_records WHERE batch_number = ?', [batchNumber]);
      return { success: true };
    } catch (error) {
      console.error('Server error:', error);
      throw AppError.internal('服务器内部错误');
    }
  }
}
