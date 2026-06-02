import { z } from 'zod';

export const addressSchema = z.object({
  id: z.string().optional(),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().default(false),
});

export const createAddressSchema = addressSchema.omit({ id: true });
export const updateAddressSchema = addressSchema.partial().omit({ id: true });

export type AddressType = z.infer<typeof addressSchema>;
export type CreateAddressType = z.infer<typeof createAddressSchema>;
export type UpdateAddressType = z.infer<typeof updateAddressSchema>;
