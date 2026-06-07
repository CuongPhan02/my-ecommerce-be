import { z } from 'zod';
import { userRoleEnum } from '@/db/_helpers';

const roleValues = userRoleEnum.enumValues;

export const userQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(10),
  search: z.string().optional(),
  role: z.enum(roleValues).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  isSystem: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  sort: z.enum(['desc', 'asc']).optional().default('desc'),
  sortBy: z.enum(['createdAt', 'name', 'email', 'staffCode', 'lastLogin']).optional().default('createdAt'),
});

export type UserQueryType = z.infer<typeof userQuerySchema>;

export const createUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(roleValues).optional().default('CUSTOMER'),
  isActive: z.boolean().optional().default(true),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export type CreateUserType = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  role: z.enum(roleValues).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserType = z.infer<typeof updateUserSchema>;

export const userParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export type UserParamType = z.infer<typeof userParamSchema>;

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one User ID is required for bulk deletion'),
});

export type BulkDeleteType = z.infer<typeof bulkDeleteSchema>;
