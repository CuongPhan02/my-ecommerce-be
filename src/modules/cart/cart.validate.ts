import { z } from 'zod';

export const addToCartSchema = z.object({
  productVariantId: z.string().min(1, 'ID biến thể sản phẩm là bắt buộc'),
  quantity: z.number().int().min(1, 'Số lượng phải ít nhất là 1'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Số lượng phải ít nhất là 1'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
