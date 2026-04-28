import { z } from 'zod';

const stringOrNumber = z.union([z.string(), z.number()]);

const ingredientSchema = z.object({
  material_id: stringOrNumber,
  stage: z.string().max(20).optional(),
  percentage: stringOrNumber.optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
  unit: z.string().max(20).optional().nullable(),
  loss_rate: stringOrNumber.optional().nullable(),
});

export const createPreparationSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255),
  author: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  loss_rate: stringOrNumber.optional().nullable(),
  ingredients: z.array(ingredientSchema).optional(),
});

export const updatePreparationSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255),
  author: z.string().max(100).optional().nullable(),
  loss_rate: stringOrNumber.optional().nullable(),
  ingredients: z.array(ingredientSchema).optional(),
});

export type CreatePreparationInput = z.infer<typeof createPreparationSchema>;
export type UpdatePreparationInput = z.infer<typeof updatePreparationSchema>;