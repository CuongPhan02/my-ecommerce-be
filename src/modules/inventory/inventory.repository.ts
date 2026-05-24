import { eq, desc, asc, ilike, or, and, count, gt, lte } from 'drizzle-orm';
import { productVariants, products, categories, users, inventoryTransactions } from '@/db/schema';
import { InventoryQueryType, InventoryHistoryQueryType } from './inventory.validate';
import { formatVND } from '@/utils/lib';

export class InventoryRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async getVariantStockList(query: InventoryQueryType) {
    const { page, limit, search, category, status, sort } = query;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (category) {
      conditions.push(or(eq(categories.id, category), eq(categories.slug, category)));
    }

    if (status) {
      if (status === 'IN_STOCK') {
        conditions.push(gt(productVariants.stockQuantity, productVariants.lowStockQuantity));
      } else if (status === 'LOW_STOCK') {
        conditions.push(
          and(
            lte(productVariants.stockQuantity, productVariants.lowStockQuantity),
            gt(productVariants.stockQuantity, 0)
          )
        );
      } else if (status === 'OUT_STOCK') {
        conditions.push(eq(productVariants.stockQuantity, 0));
      }
    }

    if (search) {
      conditions.push(
        or(
          ilike(productVariants.sku, `%${search}%`),
          ilike(products.name, `%${search}%`),
          ilike(categories.name, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const sortOrder = sort === 'asc' ? asc(productVariants.sku) : desc(productVariants.sku);

    const [data, totalResult] = await Promise.all([
      this.db
        .select({
          id: productVariants.id,
          sku: productVariants.sku,
          price: productVariants.price,
          purchasePrice: productVariants.purchasePrice,
          stockQuantity: productVariants.stockQuantity,
          lowStockQuantity: productVariants.lowStockQuantity,
          product: {
            id: products.id,
            name: products.name,
          },
          category: {
            id: categories.id,
            name: categories.name,
          },
        })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      this.db
        .select({ count: count() })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(whereClause)
        .then((res: any[]) => res[0]?.count ?? 0),
    ]);

    const formattedData = data.map((item: any) => ({
      ...item,
      priceFormatted: formatVND(item.price),
      purchasePriceFormatted: formatVND(item.purchasePrice || 0),
    }));

    return {
      data: formattedData,
      total: totalResult,
    };
  }

  async getVariantById(id: string) {
    const result = await this.db
      .select({
        id: productVariants.id,
        sku: productVariants.sku,
        price: productVariants.price,
        purchasePrice: productVariants.purchasePrice,
        stockQuantity: productVariants.stockQuantity,
        productId: productVariants.productId,
        lowStockQuantity: productVariants.lowStockQuantity,
      })
      .from(productVariants)
      .where(eq(productVariants.id, id))
      .limit(1);
    return result[0];
  }

  async updateVariantStock(id: string, newStock: number, newPurchasePrice?: number) {
    const updateData: any = { stockQuantity: newStock };
    if (newPurchasePrice !== undefined) {
      updateData.purchasePrice = newPurchasePrice;
    }
    const [updated] = await this.db
      .update(productVariants)
      .set(updateData)
      .where(eq(productVariants.id, id))
      .returning();
    return updated;
  }

  async createTransaction(transaction: {
    productVariantId: string;
    type: 'IMPORT' | 'ADJUST' | 'EXPORT';
    quantity: number;
    purchasePrice?: number;
    supplier?: string;
    reason?: string;
    createdBy?: string;
  }) {
    const [newTx] = await this.db
      .insert(inventoryTransactions)
      .values(transaction)
      .returning();
    return newTx;
  }

  async getTransactions(query: InventoryHistoryQueryType) {
    const { productVariantId, page, limit, type } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (productVariantId) {
      conditions.push(eq(inventoryTransactions.productVariantId, productVariantId));
    }
    if (type) {
      conditions.push(eq(inventoryTransactions.type, type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
      this.db
        .select({
          id: inventoryTransactions.id,
          type: inventoryTransactions.type,
          quantity: inventoryTransactions.quantity,
          purchasePrice: inventoryTransactions.purchasePrice,
          supplier: inventoryTransactions.supplier,
          reason: inventoryTransactions.reason,
          createdAt: inventoryTransactions.createdAt,
          productVariant: {
            id: productVariants.id,
            sku: productVariants.sku,
          },
          creator: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(inventoryTransactions)
        .innerJoin(productVariants, eq(inventoryTransactions.productVariantId, productVariants.id))
        .leftJoin(users, eq(inventoryTransactions.createdBy, users.id))
        .where(whereClause)
        .orderBy(desc(inventoryTransactions.createdAt))
        .limit(limit)
        .offset(offset),

      this.db
        .select({ count: count() })
        .from(inventoryTransactions)
        .where(whereClause)
        .then((res: any[]) => res[0]?.count ?? 0),
    ]);

    const formattedData = data.map((item: any) => ({
      ...item,
      purchasePriceFormatted: item.purchasePrice ? formatVND(item.purchasePrice) : null,
    }));

    return {
      data: formattedData,
      total: totalResult,
    };
  }
}
export type { InventoryHistoryQueryType, InventoryQueryType };
