import { z } from 'zod';

const nullableString = z.union([z.string(), z.null()]).optional().transform(v => v === '' ? null : v);

const ingredientSchema = z.object({
  material_id: z.any(),
  stage: z.enum(['preferment', 'base', 'late']).optional(),
  percentage: z.any().optional().nullable(),
  note: nullableString,
  unit: nullableString,
  loss_rate: z.any().optional().nullable(),
});

const ingredientsArray = z.array(ingredientSchema);

export const createRecipeSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255),
  type: z.enum(['dough', 'preparation'], 'type必须是dough或preparation'),
  author: z.string().max(100).optional(),
  ingredients: ingredientsArray.optional(),
  expected_temp: z.number().min(-50).max(300).optional(),
  loss_rate: z.number().min(0).max(1).optional(),
});

export const updateRecipeSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255),
  material_id: z.any().optional(),
  author: nullableString,
  ingredients: ingredientsArray.optional(),
  expected_temp: z.any().optional().nullable(),
  loss_rate: z.any().optional().nullable(),
  description: nullableString,
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;