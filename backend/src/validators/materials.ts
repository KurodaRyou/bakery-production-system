import { z } from 'zod';

export const createMaterialSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100),
  type: z.enum(['dough', 'ingredient', 'preparation'], 'type必须是dough、ingredient或preparation'),
});

export const updateMaterialSchema = z.object({
  name: z.string().min(1, '名称不能为空').max(100),
  type: z.enum(['dough', 'ingredient', 'preparation'], 'type必须是dough、ingredient或preparation'),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;