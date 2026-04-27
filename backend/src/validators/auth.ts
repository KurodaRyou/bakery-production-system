import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
});

export const updateProfileSchema = z.object({
  username: z.string().min(1, '用户名不能为空').optional(),
  password: z.string().min(6, '密码至少6位').optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: '至少需要一个要更新的字段',
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;