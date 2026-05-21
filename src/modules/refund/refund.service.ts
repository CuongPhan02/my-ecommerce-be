import { RefundRepository } from './refund.repository';
import { RefundQueryType, CreateRefundType, ApproveRefundType, RejectRefundType } from './refund.validate';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import crypto from 'crypto';

export class RefundService {
  private repo: RefundRepository;

  constructor(repo: RefundRepository) {
    this.repo = repo;
  }

  async getAllRefunds(query: RefundQueryType) {
    const { data, total } = await this.repo.getAllRefunds(query);
    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getRefundById(id: string) {
    const refund = await this.repo.getRefundById(id);
    if (!refund) {
      throw new NotFoundError('Refund request not found');
    }
    return refund;
  }

  async createRefund(userId: string, data: CreateRefundType) {
    // Check if order exists
    const order = await this.repo.findOrderById(data.orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestError('This order does not belong to you');
    }

    // Check if order status allows refund (e.g. DELIVERED, RETURNED)
    if (order.status !== 'DELIVERED' && order.status !== 'RETURNED') {
      throw new BadRequestError('Can only refund delivered or returned orders');
    }

    // Generate unique code REF-XXXXXX
    const code = `REF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    return this.repo.createRefund({
      code,
      userId,
      orderId: data.orderId,
      reason: data.reason,
      amount: data.amount,
    });
  }

  async approveRefund(id: string, data: ApproveRefundType) {
    const refund = await this.getRefundById(id);
    if (refund.status !== 'PENDING') {
      throw new BadRequestError(`Cannot approve refund with status ${refund.status}`);
    }

    // Approve the refund
    return this.repo.approveRefund(id, data.refundMethod, data.internalNote);
  }

  async rejectRefund(id: string, data: RejectRefundType) {
    const refund = await this.getRefundById(id);
    if (refund.status !== 'PENDING') {
      throw new BadRequestError(`Cannot reject refund with status ${refund.status}`);
    }

    return this.repo.rejectRefund(id, data.rejectReason);
  }
}
