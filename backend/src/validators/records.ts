import { z } from 'zod';

export const createRecordSchema = z.object({
  batch_number: z.string().min(1, '批次号不能为空').max(10),
  dough_name: z.string().min(1, '面团种类不能为空').max(100),
  dry_temp: z.number().min(-50).max(300).optional(),
  room_temp: z.number().min(-50).max(300).optional(),
  ice_ratio: z.number().min(0).max(1).optional(),
  water_temp: z.number().min(-50).max(300).optional(),
  flour_amount: z.number().min(0).max(10000).optional(),
  water_amount: z.number().min(0).max(10000).optional(),
  machine_speed: z.string().max(50).optional(),
  gluten_level: z.number().min(0).max(100).optional(),
  output_temp: z.number().min(-50).max(300).optional(),
  machine: z.string().max(50).optional(),
  operator: z.string().max(50).optional(),
  bulk_ferment_temp: z.number().min(-50).max(300).optional(),
  bulk_ferment_time: z.number().min(0).max(10000).optional(),
});

export const updateRecordSchema = z.object({
  dough_name: z.string().min(1).max(100).optional(),
  dry_temp: z.number().min(-50).max(300).optional(),
  room_temp: z.number().min(-50).max(300).optional(),
  ice_ratio: z.number().min(0).max(1).optional(),
  water_temp: z.number().min(-50).max(300).optional(),
  flour_amount: z.number().min(0).max(10000).optional(),
  water_amount: z.number().min(0).max(10000).optional(),
  dough_weight: z.number().min(0).max(10000).optional(),
  machine_speed: z.string().max(50).optional(),
  gluten_level: z.number().min(0).max(100).optional(),
  output_temp: z.number().min(-50).max(300).optional(),
  machine: z.string().max(50).optional(),
  operator: z.string().max(50).optional(),
  bulk_ferment_temp: z.number().min(-50).max(300).optional(),
  bulk_ferment_time: z.number().min(0).max(10000).optional(),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;