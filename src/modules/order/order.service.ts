import { NotFoundError, BadRequestError } from '@/utils/errors';
import { OrderRepository } from './order.repository';
import { GetOrdersQuery, UpdateOrderInput, CreateOrderInput } from './order.validate';

export class OrderService {
  private repo: OrderRepository;

  constructor(repo: OrderRepository) {
    this.repo = repo;
  }

  // ======= ADMIN: Lấy tất cả đơn hàng =======
  async getAllOrders(filter: GetOrdersQuery) {
    const { orders, total } = await this.repo.getAllOrders(filter);
    return {
      data: orders,
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  // ======= ADMIN: Lấy chi tiết đơn hàng =======
  async getOrderById(id: string) {
    const order = await this.repo.getOrderById(id);
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  // ======= ADMIN: Cập nhật trạng thái đơn hàng =======
  async updateOrder(id: string, data: UpdateOrderInput) {
    // Kiểm tra đơn hàng tồn tại
    await this.getOrderById(id);
    return this.repo.updateOrder(id, data);
  }

  // ======= USER: Lấy đơn hàng của tôi =======
  async getMyOrders(userId: string, page: number, limit: number) {
    const { orders, total } = await this.repo.getOrdersByUserId(userId, page, limit);
    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ======= USER: Lấy chi tiết đơn hàng của tôi =======
  async getMyOrderById(orderId: string, userId: string) {
    const order = await this.repo.getMyOrderById(orderId, userId);
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  // ======= USER: ĐẶT HÀNG MỚI (CHECKOUT) =======
  async createOrder(userId: string, data: CreateOrderInput) {
    // 1. Kiểm tra địa chỉ giao hàng hợp lệ hoặc xử lý địa chỉ tùy chỉnh
    let shippingAddressId = data.shippingAddressId;
    let customAddress = undefined;

    if (shippingAddressId) {
      const address = await this.repo.findAddressById(shippingAddressId, userId);
      if (!address) {
        throw new NotFoundError('Shipping address not found');
      }
    } else {
      // Ghép thông tin Họ tên, SĐT, Email và Ghi chú giao hàng vào trường street để bảo toàn dữ liệu
      const recipientDetails = [
        `Họ tên: ${data.shippingName}`,
        `SĐT: ${data.shippingPhone}`,
        data.shippingEmail ? `Email: ${data.shippingEmail}` : '',
        data.note ? `Ghi chú: ${data.note}` : '',
      ]
        .filter(Boolean)
        .join(' - ');

      customAddress = {
        street: `${data.street} (${recipientDetails})`,
        city: data.city || '',
        province: data.province || '',
        postalCode: '700000', // Postal code mặc định
        country: 'Vietnam',
      };
    }

    // 2. Kiểm tra giỏ hàng của người dùng
    const cart = await this.repo.findActiveCartWithItems(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // 3. Tính toán tổng tiền sản phẩm (Subtotal) và kiểm tra tồn kho
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const variant = item.productVariant;
      if (!variant) {
        throw new NotFoundError('Product variant not found in one of the cart items');
      }

      // Kiểm tra số lượng tồn kho
      if ((variant.stockQuantity ?? 0) < item.quantity) {
        throw new BadRequestError(`Sản phẩm với mã SKU ${variant.sku} đã hết hàng hoặc không đủ tồn kho`);
      }

      subtotal += variant.price * item.quantity;
      orderItemsData.push({
        productVariantId: variant.id,
        quantity: item.quantity,
        priceAtPurchase: variant.price,
      });
    }

    // 4. Áp dụng mã giảm giá (Coupon) nếu có
    let discountAmount = 0;
    let couponId: string | null = null;

    if (data.couponCode) {
      const coupon = await this.repo.findCouponByCode(data.couponCode);
      if (!coupon || !coupon.isActive || new Date(coupon.expiresAt) < new Date()) {
        throw new BadRequestError('Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng');
      }

      couponId = coupon.id;
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = subtotal * (coupon.value / 100);
      } else if (coupon.discountType === 'FIXED') {
        discountAmount = coupon.value;
      }

      // Số tiền giảm tối đa không vượt quá giá trị giỏ hàng
      discountAmount = Math.min(discountAmount, subtotal);
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    // 5. Thực hiện lưu cơ sở dữ liệu qua database transaction
    const newOrder = await this.repo.executeOrderTransaction({
      userId,
      totalAmount,
      discountAmount,
      couponId,
      shippingAddressId,
      customAddress,
      items: orderItemsData,
      cartId: cart.id,
    });

    return newOrder;
  }
}
