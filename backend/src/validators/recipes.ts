import { z } from 'zod';

const ingredientSchema = z.object({
  material_id: z.number(),
  stage: z.enum(['preferment', 'base', 'late']).optional(),
  percentage: z.number().min(0).max(100).optional(),
  note: z.string().max(1000).optional(),
  unit: z.string().max(20).optional(),
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
  material_id: z.number().optional(),
  author: z.string().max(100).optional(),
  ingredients: ingredientsArray.optional(),
  expected_temp: z.number().min(-50).max(300).optional(),
  loss_rate: z.number().min(0).max(1).optional(),
  description: z.string().max(1000).optional(),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;