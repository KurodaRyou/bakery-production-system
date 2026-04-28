import { z } from 'zod';

const stringOrNumber = z.union([z.string(), z.number()]);

const ingredientSchema = z.object({
  material_id: stringOrNumber,
  stage: z.enum(['preferment', 'base', 'late']).optional(),
  percentage: stringOrNumber.optional().nullable(),
  note: z.any().optional().nullable(),  // allow any - frontend sends strings or null
  unit: z.any().optional().nullable(),
  loss_rate: stringOrNumber.optional().nullable(),
});

const ingredientsArray = z.array(ingredientSchema);

export const createRecipeSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255),
  type: z.enum(['dough', 'preparation'], 'type必须是dough或preparation'),
  author: z.string().max(100).optional().nullable(),
  ingredients: ingredientsArray.optional(),
  expected_temp: stringOrNumber.optional().nullable(),
  loss_rate: stringOrNumber.optional().nullable(),
});

export const updateRecipeSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(255),
  material_id: stringOrNumber.optional().nullable(),
  author: z.string().optional().nullable(),
  ingredients: ingredientsArray.optional(),
  expected_temp: stringOrNumber.optional().nullable(),
  loss_rate: stringOrNumber.optional().nullable(),
  description: z.string().optional().nullable(),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
