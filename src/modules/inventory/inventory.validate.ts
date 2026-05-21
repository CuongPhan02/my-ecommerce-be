import { z } from 'zod';

export const inventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_STOCK']).optional(),
  sort: z.enum(['desc', 'asc']).optional().default('desc'),
});

export type InventoryQueryType = z.infer<typeof inventoryQuerySchema>;

export const importStockSchema = z.object({
  productVariantId: z.string().min(1, 'Product Variant ID is required'),
  quantity: z.number().int().positive('Import quantity must be greater than 0'),
  purchasePrice: z.number().positive('Purchase price must be greater than 0'),
  supplier: z.string().min(1, 'Supplier/Factory name is required'),
});

export type ImportStockType = z.infer<typeof importStockSchema>;

export const adjustStockSchema = z.object({
  productVariantId: z.string().min(1, 'Product Variant ID is required'),
  quantity: z.number().int().min(0, 'Adjusted quantity must be 0 or greater'),
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
});

export type AdjustStockType = z.infer<typeof adjustStockSchema>;

export const inventoryHistoryQuerySchema = z.object({
  productVariantId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  type: z.enum(['IMPORT', 'ADJUST', 'EXPORT']).optional(),
});

export type InventoryHistoryQueryType = z.infer<typeof inventoryHistoryQuerySchema>;

export const inventoryParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type InventoryParamType = z.infer<typeof inventoryParamSchema>;
