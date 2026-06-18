import { NotFoundError, BadRequestError } from '@/utils/errors';
import { OrderRepository } from './order.repository';
import {
  GetOrdersQuery,
  UpdateOrderInput,
  CreateOrderInput,
} from './order.validate';
import { BrevoProvider } from '@/provider/brevo-provider';

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
    if (!order) throw new NotFoundError('Không tìm thấy đơn hàng');
    return order;
  }

  // ======= ADMIN: Cập nhật trạng thái đơn hàng =======
  async updateOrder(id: string, data: UpdateOrderInput) {
    // Kiểm tra đơn hàng tồn tại
    const oldOrder = await this.getOrderById(id);
    const updatedOrder = await this.repo.updateOrder(id, data);

    // Gửi email khi trạng thái đơn hàng thay đổi
    if (data.status && data.status !== oldOrder.status) {
      try {
        if (
          updatedOrder &&
          updatedOrder.customer &&
          updatedOrder.customer.email
        ) {
          let subject = `Cập nhật trạng thái đơn hàng #${updatedOrder.id}`;
          if (data.status === 'SHIPPED') {
            subject = `Đơn hàng #${updatedOrder.id} đã được gửi đi`;
          } else if (data.status === 'DELIVERED') {
            subject = `Giao hàng thành công đơn hàng #${updatedOrder.id}`;
          } else if (data.status === 'CANCELLED') {
            subject = `Đơn hàng #${updatedOrder.id} đã bị hủy`;
          }

          await BrevoProvider.sendReactMail(
            updatedOrder.customer.email,
            subject,
            'OrderStatusEmail',
            { order: updatedOrder }
          );
        }
      } catch (error) {
        console.error(
          `❌ Gửi email cập nhật trạng thái lỗi (Order #${id}):`,
          error
        );
      }
    }

    return updatedOrder;
  }

  // ======= USER: Lấy đơn hàng của tôi =======
  async getMyOrders(userId: string, page: number, limit: number) {
    const { orders, total } = await this.repo.getOrdersByUserId(
      userId,
      page,
      limit
    );
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
    if (!order) throw new NotFoundError('Không tìm thấy đơn hàng');
    return order;
  }

  // ======= USER: XÁC NHẬN ĐÃ NHẬN HÀNG =======
  async confirmReceipt(orderId: string, userId: string) {
    const order = await this.getMyOrderById(orderId, userId);

    // Chỉ có thể xác nhận khi đơn hàng đang ở trạng thái SHIPPED (đã giao cho đơn vị vận chuyển)
    // Hoặc nếu muốn thoáng hơn thì có thể cho phép khi ở trạng thái PROCESSING/SHIPPED
    if (order.status === 'DELIVERED') {
      throw new BadRequestError(
        'Đơn hàng đã được xác nhận nhận hàng trước đó.'
      );
    }

    if (order.status === 'CANCELLED' || order.status === 'RETURNED') {
      throw new BadRequestError(
        'Không thể xác nhận nhận hàng cho đơn hàng đã hủy hoặc hoàn trả.'
      );
    }

    return this.repo.updateOrder(orderId, { status: 'DELIVERED' });
  }

  // ======= USER: ĐẶT HÀNG MỚI (CHECKOUT) =======
  async createOrder(userId: string, data: CreateOrderInput) {
    // 1. Kiểm tra địa chỉ giao hàng hợp lệ hoặc xử lý địa chỉ tùy chỉnh
    let shippingAddressId = data.shippingAddressId;
    let customAddress = undefined;

    if (shippingAddressId) {
      const address = await this.repo.findAddressById(
        shippingAddressId,
        userId
      );
      if (!address) {
        throw new NotFoundError('Không tìm thấy địa chỉ giao hàng');
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
      throw new BadRequestError('Giỏ hàng trống');
    }

    // 3. Tính toán tổng tiền sản phẩm (Subtotal) và kiểm tra tồn kho
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      const variant = item.productVariant;
      if (!variant) {
        throw new NotFoundError(
          'Không tìm thấy biến thể sản phẩm trong giỏ hàng'
        );
      }

      // Kiểm tra số lượng tồn kho
      if ((variant.stockQuantity ?? 0) < item.quantity) {
        throw new BadRequestError(
          `Sản phẩm với mã SKU ${variant.sku} đã hết hàng hoặc không đủ tồn kho`
        );
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
      if (!coupon || !coupon.isActive) {
        throw new BadRequestError(
          'Mã giảm giá không hợp lệ hoặc đã bị tạm dừng'
        );
      }

      // Check expiration (vouchers table uses `expirationDate`)
      if (
        coupon.expirationDate &&
        new Date(coupon.expirationDate) < new Date()
      ) {
        throw new BadRequestError('Mã giảm giá đã hết hạn sử dụng');
      }

      // Check minimum order value
      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        throw new BadRequestError(
          `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ để sử dụng mã này`
        );
      }

      // Check usage limit
      if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) {
        throw new BadRequestError('Mã giảm giá đã hết lượt sử dụng');
      }

      couponId = coupon.id;
      if (coupon.type === 'PERCENTAGE') {
        discountAmount = subtotal * (coupon.discountValue / 100);
      } else if (coupon.type === 'FIXED') {
        discountAmount = coupon.discountValue;
      }

      // Số tiền giảm tối đa không vượt quá giá trị giỏ hàng
      discountAmount = Math.min(discountAmount, subtotal);
    }

    // 4.5. Xử lý Vận chuyển (Shipping)
    let shippingFee = 0;
    let shippingMethodName = undefined;

    const shippingConfig = await this.repo.findShippingConfig();
    const isShippingEnabled = shippingConfig?.value?.enableShipping === true;

    if (isShippingEnabled) {
      if (!data.shippingMethodId) {
        throw new BadRequestError('Vui lòng chọn phương thức vận chuyển');
      }
      const shippingMethod = await this.repo.findShippingMethodById(
        data.shippingMethodId
      );
      if (!shippingMethod || !shippingMethod.isActive) {
        throw new BadRequestError(
          'Phương thức vận chuyển không hợp lệ hoặc đã bị vô hiệu hóa'
        );
      }
      shippingFee = shippingMethod.fee;
      shippingMethodName = shippingMethod.name;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount) + shippingFee;

    // 5. Thực hiện lưu cơ sở dữ liệu qua database transaction
    const newOrder = await this.repo.executeOrderTransaction({
      userId,
      totalAmount,
      discountAmount,
      couponId,
      shippingAddressId,
      customAddress,
      shippingMethod: shippingMethodName,
      shippingFee,
      paymentMethod: data.paymentMethod || 'COD',
      items: orderItemsData,
      cartId: cart.id,
    });

    // 6. Gửi email xác nhận đặt hàng thành công
    try {
      const fullOrder = await this.repo.getOrderById(newOrder.id);
      if (fullOrder && fullOrder.customer && fullOrder.customer.email) {
        await BrevoProvider.sendReactMail(
          fullOrder.customer.email,
          `Xác nhận đặt hàng thành công cho đơn hàng #${fullOrder.id}`,
          'OrderCreatedEmail',
          { order: fullOrder }
        );
      }
    } catch (error) {
      console.error(
        `❌ Gửi email đặt hàng thành công lỗi (Order #${newOrder.id}):`,
        error
      );
    }

    return newOrder;
  }
}
