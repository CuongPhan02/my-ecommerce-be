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

export const createOrderSchema = z.object({
  shippingAddressId: z.string().optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(['COD', 'VNPAY']).optional().default('COD'),

  // Thông tin giao hàng tùy chỉnh (Bắt buộc vì FE không dùng Address lưu sẵn)
  shippingName: z.string().min(1, 'Họ tên người nhận là bắt buộc'),
  shippingPhone: z.string().min(1, 'Số điện thoại người nhận là bắt buộc'),
  shippingEmail: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
  street: z.string().min(1, 'Địa chỉ cụ thể là bắt buộc'),
  province: z.string().min(1, 'Tỉnh / Thành phố là bắt buộc'),
  city: z.string().min(1, 'Quận / Huyện là bắt buộc'),
  note: z.string().optional(),
  shippingMethodId: z.string().optional(),
});

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
