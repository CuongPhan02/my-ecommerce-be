import { NotFoundError, BadRequestError } from '@/utils/errors';
import { InventoryRepository } from './inventory.repository';
import {
  InventoryQueryType,
  ImportStockType,
  AdjustStockType,
  InventoryHistoryQueryType,
  ExportStockType,
} from './inventory.validate';

export class InventoryService {
  private repo: InventoryRepository;

  constructor(repo: InventoryRepository) {
    this.repo = repo;
  }

  async getVariantStockList(query: InventoryQueryType) {
    return this.repo.getVariantStockList(query);
  }

  async importStock(userId: string, data: ImportStockType) {
    const { productVariantId, quantity, purchasePrice, supplier } = data;

    // 1. Verify variant exists
    const variant = await this.repo.getVariantById(productVariantId);
    if (!variant) {
      throw new NotFoundError('Sản phẩm biến thể không tồn tại.');
    }

    // 2. Calculate new stock quantity
    const currentStock = variant.stockQuantity ?? 0;
    const newStock = currentStock + quantity;

    // 3. Update variant stock and purchasePrice (giá vốn mới)
    const updatedVariant = await this.repo.updateVariantStock(productVariantId, newStock, purchasePrice);

    // 4. Record transaction log
    const transaction = await this.repo.createTransaction({
      productVariantId,
      type: 'IMPORT',
      quantity,
      purchasePrice,
      supplier,
      reason: `Nhập hàng từ nhà cung cấp ${supplier}`,
      createdBy: userId,
    });

    return {
      variant: updatedVariant,
      transaction,
    };
  }

  async adjustStock(userId: string, data: AdjustStockType) {
    const { productVariantId, quantity: targetQuantity, reason } = data;

    // 1. Verify variant exists
    const variant = await this.repo.getVariantById(productVariantId);
    if (!variant) {
      throw new NotFoundError('Sản phẩm biến thể không tồn tại.');
    }

    const currentStock = variant.stockQuantity ?? 0;
    const difference = targetQuantity - currentStock;

    // 2. Update stock quantity
    const updatedVariant = await this.repo.updateVariantStock(productVariantId, targetQuantity);

    // 3. Record transaction log (using difference to denote adjustment value)
    const transaction = await this.repo.createTransaction({
      productVariantId,
      type: 'ADJUST',
      quantity: difference,
      reason,
      createdBy: userId,
    });

    return {
      variant: updatedVariant,
      transaction,
    };
  }

  async exportStock(userId: string, data: ExportStockType) {
    const { items, reason } = data;

    // 1. Pre-verify all items
    const variantsToUpdate = [];
    for (const item of items) {
      const variant = await this.repo.getVariantById(item.productVariantId);
      if (!variant) {
        throw new NotFoundError(`Sản phẩm biến thể không tồn tại: ${item.productVariantId}`);
      }
      const currentStock = variant.stockQuantity ?? 0;
      if (currentStock < item.quantity) {
        throw new BadRequestError(`Không đủ số lượng trong kho cho SKU ${variant.sku} (Hiện tại: ${currentStock}, Yêu cầu: ${item.quantity}).`);
      }
      variantsToUpdate.push({
        variant,
        newStock: currentStock - item.quantity,
        quantity: item.quantity
      });
    }

    // 2. Apply updates
    const transactions = [];
    for (const update of variantsToUpdate) {
      await this.repo.updateVariantStock(update.variant.id, update.newStock);
      const tx = await this.repo.createTransaction({
        productVariantId: update.variant.id,
        type: 'EXPORT',
        quantity: update.quantity,
        reason: reason || 'Xuất kho bán hàng',
        createdBy: userId,
      });
      transactions.push(tx);
    }

    return {
      success: true,
      count: transactions.length,
      transactions,
    };
  }

  async getTransactions(query: InventoryHistoryQueryType) {
    return this.repo.getTransactions(query);
  }
}
