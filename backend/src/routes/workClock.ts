import {
  Route,
  Get,
  Post,
  Put,
  Controller,
  Path,
  Body,
  Query,
  Middlewares,
} from '@tsoa/runtime';
import { requireAuth, requireAdmin } from '../middleware/auth';
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

export interface WorkflowTemplate {
  id: number;
  name: string;
  user_id?: number;
  steps: unknown;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export interface WorkdaySlot {
  id: number;
  date: string;
  user_id: number;
  slot_index: number;
  task_type?: string;
  product_id?: number;
  description?: string;
  duration_slots?: number;
  is_temporary: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  start_slot: number;
  end_slot: number;
  next_day?: boolean;
}

function notImplemented(): never {
  throw new AppError('NOT_IMPLEMENTED', {
    message: '待实现：需要先完善数据结构',
    statusCode: 501,
  });
}

@Route('workflow-templates')
export class WorkflowTemplatesController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    notImplemented();
  }

  @Post()
  @Middlewares(requireAuth, requireAdmin)
  public async createWorkflowTemplate(
    @Body() _body: unknown,
  ): Promise<{ success: boolean }> {
    notImplemented();
  }
}

@Route('workday-slots')
export class WorkdaySlotsController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listWorkdaySlots(
    @Query() _date: string,
    @Query() _user_id: number,
  ): Promise<WorkdaySlot[]> {
    notImplemented();
  }

  @Post()
  @Middlewares(requireAuth)
  public async createWorkdaySlot(
    @Body() _body: unknown,
  ): Promise<{ success: boolean }> {
    notImplemented();
  }

  @Put('{id}')
  @Middlewares(requireAuth)
  public async updateWorkdaySlot(
    @Path() id: number,
    @Body() _body: unknown,
  ): Promise<{ success: boolean }> {
    notImplemented();
  }
}

@Route('shifts')
export class ShiftsController extends Controller {
  @Get()
  @Middlewares(requireAuth)
  public async listShifts(): Promise<Shift[]> {
    notImplemented();
  }

  @Post()
  @Middlewares(requireAuth, requireAdmin)
  public async createShift(
    @Body() _body: unknown,
  ): Promise<{ success: boolean }> {
    notImplemented();
  }
}
