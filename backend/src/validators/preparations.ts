import { z } from 'zod';

const ingredientSchema = z.object({
  material_id: z.number(),
  stage: z.string().max(20).optional(),
  percentage: z.number().min(0).max(100).optional(),
  note: z.string().max(1000).optional(),
  unit: z.string().max(20).optional(),
});

export const createPreparationSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255),
  author: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  loss_rate: z.number().min(0).max(1).optional(),
  ingredients: z.array(ingredientSchema).optional(),
});

export const updatePreparationSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255),
  author: z.string().max(100).optional(),
  loss_rate: z.number().min(0).max(1).optional(),
  ingredients: z.array(ingredientSchema).optional(),
});

export type CreatePreparationInput = z.infer<typeof createPreparationSchema>;
export type UpdatePreparationInput = z.infer<typeof updatePreparationSchema>;