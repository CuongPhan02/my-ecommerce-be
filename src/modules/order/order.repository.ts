import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import { orders, orderItems, payments, carts, cartItems, coupons, refundRequests } from '@/db/schema/orders';
import { vouchers } from '@/db/schema/vouchers';
import { users, addresses } from '@/db/schema/users';
import { products, productVariants } from '@/db/schema/products';
import { media } from '@/db/schema/media';
import { GetOrdersQuery, UpdateOrderInput } from './order.validate';
import { formatVND } from '@/utils/lib';

export class OrderRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // ======= GET ALL ORDERS (Admin) =======
  async getAllOrders(filter: GetOrdersQuery) {
    const { page, limit, search, status, paymentStatus, sort } = filter;
    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: any[] = [];

    if (status) {
      conditions.push(eq(orders.status, status));
    }

    if (paymentStatus) {
      conditions.push(eq(payments.status, paymentStatus));
    }

    if (search) {
      conditions.push(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(orders.id, `%${search}%`)
        )
      );
    }

    // Build ORDER BY
    let orderByClause;
    switch (sort) {
      case 'oldest':
        orderByClause = asc(orders.createdAt);
        break;
      case 'amount_asc':
        orderByClause = asc(orders.totalAmount);
        break;
      case 'amount_desc':
        orderByClause = desc(orders.totalAmount);
        break;
      case 'newest':
      default:
        orderByClause = desc(orders.createdAt);
        break;
    }

    const query = this.db
      .select({
        id: orders.id,
        totalAmount: orders.totalAmount,
        status: orders.status,
        discountAmount: orders.discountAmount,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
        },
        payment: {
          id: payments.id,
          method: payments.method,
          status: payments.status,
          amount: payments.amount,
        },
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const countQuery = this.db
      .select({ id: orders.id })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const [rows, countRows] = await Promise.all([query, countQuery]);

    const formattedOrders = rows.map(
      (order: {
        totalAmount: number;
        discountAmount: any;
        payment: { amount: number };
      }) => ({
        ...order,
        totalAmountFormatted: formatVND(order.totalAmount),
        discountAmountFormatted: formatVND(order.discountAmount || 0),
        payment: order.payment
          ? {
              ...order.payment,
              amountFormatted: formatVND(order.payment.amount),
            }
          : null,
      })
    );

    return {
      orders: formattedOrders,
      total: countRows.length,
    };
  }

  // ======= GET ORDER BY ID (with full detail) =======
  async getOrderById(id: string) {
    const [order] = await this.db
      .select({
        id: orders.id,
        totalAmount: orders.totalAmount,
        status: orders.status,
        discountAmount: orders.discountAmount,
        couponId: orders.couponId,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        customer: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
        },
        shippingAddress: {
          id: addresses.id,
          street: addresses.street,
          city: addresses.city,
          province: addresses.province,
          postalCode: addresses.postalCode,
          country: addresses.country,
        },
        payment: {
          id: payments.id,
          method: payments.method,
          status: payments.status,
          amount: payments.amount,
          transactionId: payments.transactionId,
          createdAt: payments.createdAt,
        },
        refundRequest: {
          id: refundRequests.id,
          status: refundRequests.status,
          reason: refundRequests.reason,
          rejectReason: refundRequests.rejectReason,
        },
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(addresses, eq(orders.shippingAddressId, addresses.id))
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .leftJoin(refundRequests, eq(refundRequests.orderId, orders.id))
      .where(eq(orders.id, id));

    if (!order) return null;

    // Lấy danh sách sản phẩm trong đơn hàng
    const items = await this.db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        priceAtPurchase: orderItems.priceAtPurchase,
        variant: {
          id: productVariants.id,
          sku: productVariants.sku,
          price: productVariants.price,
        },
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          thumbnail: {
            url: media.url,
            altText: media.altText,
          },
        },
      })
      .from(orderItems)
      .leftJoin(
        productVariants,
        eq(orderItems.productVariantId, productVariants.id)
      )
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(media, eq(products.thumbnailId, media.id))
      .where(eq(orderItems.orderId, id));

    const formattedItems = items.map((item: any) => ({
      ...item,
      priceAtPurchaseFormatted: formatVND(item.priceAtPurchase),
      variant: item.variant
        ? {
            ...item.variant,
            priceFormatted: formatVND(item.variant.price),
          }
        : null,
    }));

    return {
      ...order,
      totalAmountFormatted: formatVND(order.totalAmount),
      discountAmountFormatted: formatVND(order.discountAmount || 0),
      payment: order.payment
        ? {
            ...order.payment,
            amountFormatted: formatVND(order.payment.amount),
          }
        : null,
      items: formattedItems,
    };
  }

  // ======= UPDATE ORDER STATUS =======
  async updateOrder(id: string, data: UpdateOrderInput) {
    const { status, paymentStatus } = data;

    // Cập nhật trạng thái đơn hàng
    if (status) {
      await this.db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, id));
    }

    // Cập nhật trạng thái thanh toán
    if (paymentStatus) {
      await this.db
        .update(payments)
        .set({ status: paymentStatus, updatedAt: new Date() })
        .where(eq(payments.orderId, id));
    }

    return this.getOrderById(id);
  }

  // ======= GET ORDERS BY USER =======
  async getOrdersByUserId(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    const rows = await this.db
      .select({
        id: orders.id,
        totalAmount: orders.totalAmount,
        status: orders.status,
        discountAmount: orders.discountAmount,
        createdAt: orders.createdAt,
        payment: {
          id: payments.id,
          method: payments.method,
          status: payments.status,
          amount: payments.amount,
        },
        refundRequest: {
          id: refundRequests.id,
          status: refundRequests.status,
          reason: refundRequests.reason,
          rejectReason: refundRequests.rejectReason,
        },
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .leftJoin(refundRequests, eq(refundRequests.orderId, orders.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const countRows = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.userId, userId));

    const formattedOrders = rows.map((order: any) => ({
      ...order,
      totalAmountFormatted: formatVND(order.totalAmount),
      discountAmountFormatted: formatVND(order.discountAmount || 0),
      payment: order.payment
        ? {
            ...order.payment,
            amountFormatted: formatVND(order.payment.amount),
          }
        : null,
    }));

    return { orders: formattedOrders, total: countRows.length };
  }

  // ======= GET MY ORDER BY ID =======
  async getMyOrderById(orderId: string, userId: string) {
    const order = await this.getOrderById(orderId);
    // Kiểm tra đơn hàng thuộc về user
    if (!order || (order as any).customer?.id !== userId) return null;
    return order;
  }

  // ======= TIỂM KIẾM GIỎ HÀNG ĐANG HOẠT ĐỘNG =======
  async findActiveCartWithItems(userId: string) {
    return this.db.query.carts.findFirst({
      where: eq(carts.userId, userId),
      with: {
        items: {
          with: {
            productVariant: {
              with: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  // ======= TÌM KIẾM VOUCHER THEO MÃ =======
  async findCouponByCode(code: string) {
    return this.db.query.vouchers.findFirst({
      where: eq(vouchers.code, code),
    });
  }

  // ======= TÌM KIẾM ĐỊA CHỈ GIAO HÀNG =======
  async findAddressById(id: string, userId: string) {
    return this.db.query.addresses.findFirst({
      where: and(eq(addresses.id, id), eq(addresses.userId, userId)),
    });
  }

  // ======= LẤY EMAIL NGƯỜI DÙNG =======
  async getUserEmail(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { email: true }
    });
    return user?.email;
  }

  // ======= THỰC THI GIAO DỊCH TẠO ĐƠN HÀNG =======
  async executeOrderTransaction(data: {
    userId: string;
    totalAmount: number;
    discountAmount: number;
    couponId: string | null;
    shippingAddressId?: string | undefined;
    customAddress?: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    } | undefined;
    paymentMethod: string;
    items: { productVariantId: string; quantity: number; priceAtPurchase: number }[];
    cartId: string;
  }) {
    return this.db.transaction(async (tx: any) => {
      // 1. Khấu trừ tồn kho cho từng sản phẩm
      for (const item of data.items) {
        const [variant] = await tx
          .select({ stockQuantity: productVariants.stockQuantity })
          .from(productVariants)
          .where(eq(productVariants.id, item.productVariantId));

        if (!variant || (variant.stockQuantity ?? 0) < item.quantity) {
          throw new Error(`Sản phẩm biến thể ${item.productVariantId} đã hết hàng`);
        }

        await tx
          .update(productVariants)
          .set({
            stockQuantity: (variant.stockQuantity ?? 0) - item.quantity,
          })
          .where(eq(productVariants.id, item.productVariantId));
      }

      // 2. Nếu không có shippingAddressId, tiến hành tạo mới địa chỉ giao hàng tùy chỉnh
      let finalAddressId = data.shippingAddressId;
      if (!finalAddressId && data.customAddress) {
        const [newAddr] = await tx
          .insert(addresses)
          .values({
            userId: data.userId,
            street: data.customAddress.street,
            city: data.customAddress.city,
            province: data.customAddress.province,
            postalCode: data.customAddress.postalCode,
            country: data.customAddress.country,
            isDefault: false,
          })
          .returning();
        if (!newAddr) {
          throw new Error('Không thể tạo địa chỉ giao hàng tùy chỉnh');
        }
        finalAddressId = newAddr.id;
      }

      if (!finalAddressId) {
        throw new Error('Địa chỉ giao hàng là bắt buộc');
      }

      // 3. Tạo đơn hàng mới
      const [newOrder] = await tx
        .insert(orders)
        .values({
          userId: data.userId,
          totalAmount: data.totalAmount,
          discountAmount: data.discountAmount,
          couponId: null, // voucher ID is not compatible with coupon FK, discount is tracked via discountAmount
          shippingAddressId: finalAddressId,
          status: 'PENDING',
        })
        .returning();

      if (!newOrder) {
        throw new Error('Không thể tạo đơn hàng');
      }

      // 4. Tạo chi tiết đơn hàng (Order Items)
      const orderItemsValues = data.items.map((item) => ({
        orderId: newOrder.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
      }));

      await tx.insert(orderItems).values(orderItemsValues);

      // 5. Tạo bản ghi thanh toán tương ứng
      await tx.insert(payments).values({
        amount: data.totalAmount,
        method: data.paymentMethod,
        orderId: newOrder.id,
        status: 'PENDING',
      });

      // 6. Xóa giỏ hàng của người dùng
      await tx.delete(cartItems).where(eq(cartItems.cartId, data.cartId));

      return newOrder;
    });
  }
}
