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

// ======= CREATE ORDER =======
export const createOrderSchema = z
  .object({
    shippingAddressId: z.string().optional(),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(['COD', 'VNPAY']).optional().default('COD'),

    // Thông tin giao hàng tùy chỉnh
    shippingName: z.string().optional(),
    shippingPhone: z.string().optional(),
    shippingEmail: z.string().optional(),
    street: z.string().optional(),
    province: z.string().optional(),
    city: z.string().optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.shippingAddressId) {
        return (
          !!data.street &&
          !!data.province &&
          !!data.city &&
          !!data.shippingName &&
          !!data.shippingPhone
        );
      }
      return true;
    },
    {
      message:
        'Vui lòng cung cấp shippingAddressId hoặc điền đầy đủ thông tin vận chuyển (Họ tên, số điện thoại, địa chỉ, tỉnh/thành phố, quận/huyện)',
      path: ['shippingAddressId'],
    }
  );

export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
