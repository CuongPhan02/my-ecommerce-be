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
  productVariantId: z.string().min(1, 'ID biến thể sản phẩm là bắt buộc'),
  quantity: z.number().int().positive('Số lượng nhập phải lớn hơn 0'),
  purchasePrice: z.number().positive('Giá nhập phải lớn hơn 0'),
  supplier: z.string().min(1, 'Tên nhà cung cấp/nhà máy là bắt buộc'),
});

export type ImportStockType = z.infer<typeof importStockSchema>;

export const adjustStockSchema = z.object({
  productVariantId: z.string().min(1, 'ID biến thể sản phẩm là bắt buộc'),
  quantity: z.number().int().min(0, 'Số lượng điều chỉnh phải từ 0 trở lên'),
  reason: z.string().min(5, 'Lý do phải có ít nhất 5 ký tự'),
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
  id: z.string().min(1, 'ID là bắt buộc'),
});

export type InventoryParamType = z.infer<typeof inventoryParamSchema>;

export const exportStockSchema = z.object({
  items: z.array(z.object({
    productVariantId: z.string().min(1, 'ID biến thể sản phẩm là bắt buộc'),
    quantity: z.number().int().positive('Số lượng xuất phải lớn hơn 0'),
  })).min(1, 'Cần chọn ít nhất 1 sản phẩm để xuất'),
  reason: z.string().optional().default('Xuất kho bán hàng'),
});

export type ExportStockType = z.infer<typeof exportStockSchema>;
