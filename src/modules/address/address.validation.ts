import { z } from 'zod';

export const addressSchema = z.object({
  receiverName: z.string().min(1, 'Họ tên người nhận là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  street: z.string().min(1, 'Địa chỉ chi tiết là bắt buộc'),
  city: z.string().min(1, 'Thành phố là bắt buộc'),
  province: z.string().min(1, 'Tỉnh/Thành là bắt buộc'),
  postalCode: z.string().min(1, 'Mã bưu điện là bắt buộc'),
  country: z.string().min(1, 'Quốc gia là bắt buộc'),
  isDefault: z.boolean().optional().default(false),
});

export const createAddressSchema = addressSchema.omit({});
export const updateAddressSchema = addressSchema.partial().omit({});

export type AddressType = z.infer<typeof addressSchema>;
export type CreateAddressType = z.infer<typeof createAddressSchema>;
export type UpdateAddressType = z.infer<typeof updateAddressSchema>;
