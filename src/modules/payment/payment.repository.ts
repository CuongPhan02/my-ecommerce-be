import { Database } from '@/plugins/database';
import { orders, payments } from '@/db/schema/orders';
import { eq } from 'drizzle-orm';

export class PaymentRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async findOrderById(orderId: string) {
    return this.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        payment: true,
      },
    });
  }

  async findPaymentByOrderId(orderId: string) {
    return this.db.query.payments.findFirst({
      where: eq(payments.orderId, orderId),
    });
  }

  async createPayment(data: {
    amount: number;
    method: string;
    orderId: string;
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    transactionId?: string;
  }) {
    const [newPayment] = await this.db
      .insert(payments)
      .values({
        amount: data.amount,
        method: data.method,
        orderId: data.orderId,
        status: data.status || 'PENDING',
        transactionId: data.transactionId || null,
      })
      .returning();
    return newPayment;
  }

  async updatePaymentStatus(
    orderId: string,
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED',
    transactionId?: string
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    const [updatedPayment] = await this.db
      .update(payments)
      .set(updateData)
      .where(eq(payments.orderId, orderId))
      .returning();
    return updatedPayment;
  }

  async updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED'
  ) {
    const [updatedOrder] = await this.db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }
}
