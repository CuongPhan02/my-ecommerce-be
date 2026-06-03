import { NotFoundError, BadRequestError } from '@/utils/errors';
import { CartRepository } from './cart.repository';

export class CartService {
  private repo: CartRepository;

  constructor(repo: CartRepository) {
    this.repo = repo;
  }

  async getCart(userId: string) {
    const cart = await this.repo.getCartDetails(userId);
    if (!cart) {
      throw new NotFoundError('Không tìm thấy giỏ hàng');
    }
    return cart;
  }

  async addItemToCart(userId: string, productVariantId: string, quantity: number) {
    // 1. Check if variant exists
    const variant = await this.repo.findProductVariant(productVariantId);
    if (!variant) {
      throw new NotFoundError('Sản phẩm biến thể không tồn tại');
    }

    // 2. Validate stock quantity
    const stock = variant.stockQuantity ?? 0;
    if (stock < quantity) {
      throw new BadRequestError('Số lượng yêu cầu vượt quá số lượng tồn kho');
    }

    // 3. Get or create cart for user
    const cart = await this.repo.getOrCreateCart(userId);
    if (!cart) {
      throw new NotFoundError('Không thể tạo hoặc lấy giỏ hàng');
    }

    // 4. Add item to cart
    await this.repo.addItemToCart(cart.id, productVariantId, quantity);

    // 5. Return updated cart details
    return this.getCart(userId);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    // 1. Get user cart
    const cart = await this.repo.getOrCreateCart(userId);
    if (!cart) {
      throw new NotFoundError('Không thể tạo hoặc lấy giỏ hàng');
    }

    // 2. Check if item exists in this cart
    const cartDetails = await this.repo.getCartDetails(userId);
    const existingItem = cartDetails?.items.find((i) => i.id === itemId);

    if (!existingItem) {
      throw new NotFoundError('Sản phẩm trong giỏ hàng không tồn tại');
    }

    // 3. Check variant stock
    const variant = await this.repo.findProductVariant(existingItem.productVariantId);
    if (!variant) {
      throw new NotFoundError('Sản phẩm biến thể không tồn tại');
    }

    const stock = variant.stockQuantity ?? 0;
    if (stock < quantity) {
      throw new BadRequestError('Số lượng yêu cầu vượt quá số lượng tồn kho');
    }

    // 4. Update quantity
    await this.repo.updateItemQuantity(cart.id, itemId, quantity);

    // 5. Return updated cart details
    return this.getCart(userId);
  }

  async removeItemFromCart(userId: string, itemId: string) {
    // 1. Get user cart
    const cart = await this.repo.getOrCreateCart(userId);
    if (!cart) {
      throw new NotFoundError('Không thể tạo hoặc lấy giỏ hàng');
    }

    // 2. Check if item exists in this cart
    const cartDetails = await this.repo.getCartDetails(userId);
    const existingItem = cartDetails?.items.find((i) => i.id === itemId);

    if (!existingItem) {
      throw new NotFoundError('Sản phẩm trong giỏ hàng không tồn tại');
    }

    // 3. Remove item
    await this.repo.removeItemFromCart(cart.id, itemId);

    // 4. Return updated cart details
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.repo.getOrCreateCart(userId);
    if (!cart) {
      throw new NotFoundError('Không thể tạo hoặc lấy giỏ hàng');
    }
    await this.repo.clearCart(cart.id);
    return this.getCart(userId);
  }
}
