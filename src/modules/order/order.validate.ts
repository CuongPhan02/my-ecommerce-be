import { z } from 'zod';

// ======= ORDER STATUS ENUM =======
export const ORDER_STATUS_VALUES = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
] as const;

export const PAYMENT_STATUS_VALUES = [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
] as const;

// ======= QUERY FILTERS =======
export const getOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
  sort: z
    .enum(['newest', 'oldest', 'amount_asc', 'amount_desc'])
    .default('newest')
    .optional(),
});

// ======= UPDATE ORDER =======
export const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS_VALUES).optional(),
});

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
