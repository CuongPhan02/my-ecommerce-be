import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';
import { orders, orderItems, payments } from '@/db/schema/orders';
import { users, addresses } from '@/db/schema/users';
import { products, productVariants } from '@/db/schema/products';
import { media } from '@/db/schema/media';
import { GetOrdersQuery, UpdateOrderInput } from './order.validate';

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

    return {
      orders: rows,
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
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(addresses, eq(orders.shippingAddressId, addresses.id))
      .leftJoin(payments, eq(payments.orderId, orders.id))
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
      .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(media, eq(products.thumbnailId, media.id))
      .where(eq(orderItems.orderId, id));

    return { ...order, items };
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
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const countRows = await this.db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.userId, userId));

    return { orders: rows, total: countRows.length };
  }

  // ======= GET MY ORDER BY ID =======
  async getMyOrderById(orderId: string, userId: string) {
    const order = await this.getOrderById(orderId);
    // Kiểm tra đơn hàng thuộc về user
    if (!order || (order as any).customer?.id !== userId) return null;
    return order;
  }
}
