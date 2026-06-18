import { eq, desc, asc, ilike, or, and, count, sql } from 'drizzle-orm';
import { refundRequests, orders, users, payments, orderItems, productVariants } from '@/db/schema';
import { RefundQueryType } from './refund.validate';
import { formatVND } from '@/utils/lib';

export class RefundRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async getAllRefunds(query: RefundQueryType) {
    const { page, limit, search, status, sort } = query;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status) {
      conditions.push(eq(refundRequests.status, status));
    }

    if (search) {
      conditions.push(
        or(
          ilike(refundRequests.code, `%${search}%`),
          ilike(orders.id, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.name, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const sortOrder = sort === 'asc' ? asc(refundRequests.createdAt) : desc(refundRequests.createdAt);

    const [data, totalResult] = await Promise.all([
      this.db
        .select({
          id: refundRequests.id,
          code: refundRequests.code,
          reason: refundRequests.reason,
          status: refundRequests.status,
          amount: refundRequests.amount,
          createdAt: refundRequests.createdAt,
          order: {
            id: orders.id,
            totalAmount: orders.totalAmount,
          },
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
            avatar: users.avatarUrl,
          },
        })
        .from(refundRequests)
        .leftJoin(orders, eq(refundRequests.orderId, orders.id))
        .leftJoin(users, eq(refundRequests.userId, users.id))
        .where(whereClause)
        .orderBy(sortOrder)
        .limit(limit)
        .offset(offset),
      
      this.db
        .select({ count: count() })
        .from(refundRequests)
        .leftJoin(orders, eq(refundRequests.orderId, orders.id))
        .leftJoin(users, eq(refundRequests.userId, users.id))
        .where(whereClause)
        .then((res: any[]) => res[0]?.count ?? 0),
    ]);

    const formattedData = data.map((item: any) => ({
      ...item,
      amountFormatted: formatVND(item.amount),
      order: item.order ? {
        ...item.order,
        totalAmountFormatted: formatVND(item.order.totalAmount),
      } : null,
    }));

    return {
      data: formattedData,
      total: totalResult,
    };
  }

  async getRefundById(id: string) {
    const result = await this.db
      .select({
        id: refundRequests.id,
        code: refundRequests.code,
        reason: refundRequests.reason,
        status: refundRequests.status,
        amount: refundRequests.amount,
        refundMethod: refundRequests.refundMethod,
        rejectReason: refundRequests.rejectReason,
        internalNote: refundRequests.internalNote,
        createdAt: refundRequests.createdAt,
        updatedAt: refundRequests.updatedAt,
        order: {
          id: orders.id,
          status: orders.status,
          totalAmount: orders.totalAmount,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
        },
      })
      .from(refundRequests)
      .leftJoin(orders, eq(refundRequests.orderId, orders.id))
      .leftJoin(users, eq(refundRequests.userId, users.id))
      .where(eq(refundRequests.id, id))
      .limit(1);

    const refund = result[0];
    if (!refund) return null;

    return {
      ...refund,
      amountFormatted: formatVND(refund.amount),
      order: refund.order ? {
        ...refund.order,
        totalAmountFormatted: formatVND(refund.order.totalAmount),
      } : null,
    };
  }

  async findOrderById(orderId: string) {
    const result = await this.db
      .select({
        id: orders.id,
        userId: orders.userId,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    return result[0];
  }

  async createRefund(data: { code: string; orderId: string; userId: string; reason: string; amount: number }) {
    const [newRefund] = await this.db.insert(refundRequests).values(data).returning();
    return newRefund;
  }

  async approveRefund(id: string, refundMethod: string, internalNote?: string) {
    return this.db.transaction(async (tx: any) => {
      // 1. Cập nhật refundRequests
      const [updatedRefund] = await tx
        .update(refundRequests)
        .set({
          status: 'APPROVED',
          refundMethod,
          internalNote,
        })
        .where(eq(refundRequests.id, id))
        .returning();

      if (!updatedRefund) throw new Error('Không tìm thấy yêu cầu hoàn trả');

      const orderId = updatedRefund.orderId;

      // 2. Cập nhật trạng thái đơn hàng
      await tx
        .update(orders)
        .set({ status: 'RETURNED' })
        .where(eq(orders.id, orderId));

      // 3. Cập nhật trạng thái thanh toán
      await tx
        .update(payments)
        .set({ status: 'REFUNDED' })
        .where(eq(payments.orderId, orderId));

      // 4. Lấy danh sách sản phẩm trong đơn để hoàn lại kho
      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      // 5. Trả lại số lượng tồn kho (restock)
      for (const item of items) {
        await tx
          .update(productVariants)
          .set({
            stockQuantity: sql`${productVariants.stockQuantity} + ${item.quantity}`,
          })
          .where(eq(productVariants.id, item.productVariantId));
      }

      return updatedRefund;
    });
  }

  async rejectRefund(id: string, rejectReason: string) {
    return this.db.transaction(async (tx: any) => {
      const [updatedRefund] = await tx
        .update(refundRequests)
        .set({
          status: 'REJECTED',
          rejectReason,
        })
        .where(eq(refundRequests.id, id))
        .returning();

      return updatedRefund;
    });
  }
}
