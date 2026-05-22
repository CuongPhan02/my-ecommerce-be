import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { vouchers } from '@/db/schema';

export const createVoucherSchema = createInsertSchema(vouchers).extend({
  code: z.string().min(3, 'Voucher code must be at least 3 characters long').regex(/^[A-Z0-9_]+$/, 'Voucher code can only contain uppercase letters, numbers, and underscores'),
  description: z.string().optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  discountValue: z.number().min(0, 'Discount value must be a positive number'),
  minOrderValue: z.number().min(0, 'Minimum order value must be a positive number').optional().default(0),
  usageLimit: z.number().int().min(1, 'Usage limit must be at least 1').optional().nullable(),
  isActive: z.boolean().optional().default(true),
  expirationDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export const updateVoucherSchema = z.object({
  code: z.string().min(3, 'Voucher code must be at least 3 characters long').regex(/^[A-Z0-9_]+$/, 'Voucher code can only contain uppercase letters, numbers, and underscores').optional(),
  description: z.string().optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']).optional(),
  discountValue: z.number().min(0, 'Discount value must be a positive number').optional(),
  minOrderValue: z.number().min(0, 'Minimum order value must be a positive number').optional(),
  usageLimit: z.number().int().min(1, 'Usage limit must be at least 1').optional().nullable(),
  isActive: z.boolean().optional(),
  expirationDate: z.string().datetime({ offset: true }).optional().nullable(),
});

export const deleteVoucherSchema = z.object({
  id: z.string().min(1, 'Invalid voucher ID'),
});

export const getVoucherSchema = z.object({
  id: z.string().min(1, 'Invalid voucher ID'),
});

export const toggleVoucherStatusSchema = z.object({
  isActive: z.boolean(),
});

export const getVouchersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'EXPIRED']).optional(),
});

export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;
export type UpdateVoucherInput = z.infer<typeof updateVoucherSchema>;
export type DeleteVoucherInput = z.infer<typeof deleteVoucherSchema>;
export type GetVoucherInput = z.infer<typeof getVoucherSchema>;
export type ToggleVoucherStatusInput = z.infer<typeof toggleVoucherStatusSchema>;
export type GetVouchersQueryInput = z.infer<typeof getVouchersQuerySchema>;
