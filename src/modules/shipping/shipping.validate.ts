import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { shippingMethods } from '@/db/schema';

export const createShippingSchema = createInsertSchema(shippingMethods).extend({
  name: z.string().min(2, 'Name is required'),
  fee: z.number().min(0, 'Fee must be non-negative'),
  estimatedDays: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateShippingSchema = createInsertSchema(shippingMethods).extend({
  name: z.string().min(2).optional(),
  fee: z.number().min(0).optional(),
  estimatedDays: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const deleteShippingSchema = z.object({
  id: z.string().cuid(),
});

export type CreateShippingInput = z.infer<typeof createShippingSchema>;
export type UpdateShippingInput = z.infer<typeof updateShippingSchema>;
export type DeleteShippingInput = z.infer<typeof deleteShippingSchema>;
