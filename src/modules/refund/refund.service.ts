import { RefundRepository } from './refund.repository';
import { RefundQueryType, CreateRefundType, ApproveRefundType, RejectRefundType } from './refund.validate';
import { NotFoundError, BadRequestError } from '@/utils/errors';
import crypto from 'crypto';
import { BrevoProvider } from '@/provider/brevo-provider';

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
      throw new NotFoundError('Không tìm thấy yêu cầu hoàn tiền');
    }
    return refund;
  }

  async createRefund(userId: string, data: CreateRefundType) {
    // Check if order exists
    const order = await this.repo.findOrderById(data.orderId);
    if (!order) {
      throw new NotFoundError('Không tìm thấy đơn hàng');
    }

    if (order.userId !== userId) {
      throw new BadRequestError('Đơn hàng này không thuộc về bạn');
    }

    // Check if order status allows refund (e.g. DELIVERED, RETURNED)
    if (order.status !== 'DELIVERED' && order.status !== 'RETURNED') {
      throw new BadRequestError('Chỉ có thể hoàn tiền cho đơn hàng đã giao hoặc đã trả hàng');
    }

    // Generate unique code REF-XXXXXX
    const code = `REF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const newRefund = await this.repo.createRefund({
      code,
      userId,
      orderId: data.orderId,
      reason: data.reason,
      amount: data.amount,
    });

    try {
      const fullRefund = await this.repo.getRefundById(newRefund.id);
      if (fullRefund && fullRefund.user && fullRefund.user.email) {
        await BrevoProvider.sendReactMail(
          fullRefund.user.email,
          `Yêu cầu trả hàng/hoàn tiền đơn hàng #${fullRefund.order.id} đang chờ duyệt`,
          'RefundStatusEmail',
          {
            refund: {
              code: fullRefund.code,
              amountFormatted: fullRefund.amountFormatted,
              reason: fullRefund.reason,
              status: fullRefund.status,
              rejectReason: fullRefund.rejectReason,
              refundMethod: fullRefund.refundMethod,
              orderId: fullRefund.order.id,
              customer: {
                name: fullRefund.user.name,
              },
            },
          }
        );
      }
    } catch (error) {
      console.error(`❌ Gửi email yêu cầu hoàn tiền lỗi (Refund #${newRefund.id}):`, error);
    }

    return newRefund;
  }

  async approveRefund(id: string, data: ApproveRefundType) {
    const refund = await this.getRefundById(id);
    if (refund.status !== 'PENDING') {
      throw new BadRequestError(`Không thể duyệt hoàn tiền với trạng thái ${refund.status}`);
    }

    // Approve the refund
    const result = await this.repo.approveRefund(id, data.refundMethod, data.internalNote);

    try {
      const fullRefund = await this.getRefundById(id);
      if (fullRefund && fullRefund.user && fullRefund.user.email) {
        await BrevoProvider.sendReactMail(
          fullRefund.user.email,
          `Yêu cầu hoàn trả đơn hàng #${fullRefund.order.id} đã được duyệt`,
          'RefundStatusEmail',
          {
            refund: {
              code: fullRefund.code,
              amountFormatted: fullRefund.amountFormatted,
              reason: fullRefund.reason,
              status: fullRefund.status,
              rejectReason: fullRefund.rejectReason,
              refundMethod: fullRefund.refundMethod,
              orderId: fullRefund.order.id,
              customer: {
                name: fullRefund.user.name,
              },
            },
          }
        );
      }
    } catch (error) {
      console.error(`❌ Gửi email duyệt hoàn tiền lỗi (Refund #${id}):`, error);
    }

    return result;
  }

  async rejectRefund(id: string, data: RejectRefundType) {
    const refund = await this.getRefundById(id);
    if (refund.status !== 'PENDING') {
      throw new BadRequestError(`Không thể từ chối hoàn tiền với trạng thái ${refund.status}`);
    }

    const result = await this.repo.rejectRefund(id, data.rejectReason);

    try {
      const fullRefund = await this.getRefundById(id);
      if (fullRefund && fullRefund.user && fullRefund.user.email) {
        await BrevoProvider.sendReactMail(
          fullRefund.user.email,
          `Yêu cầu hoàn trả đơn hàng #${fullRefund.order.id} không được chấp nhận`,
          'RefundStatusEmail',
          {
            refund: {
              code: fullRefund.code,
              amountFormatted: fullRefund.amountFormatted,
              reason: fullRefund.reason,
              status: fullRefund.status,
              rejectReason: fullRefund.rejectReason,
              refundMethod: fullRefund.refundMethod,
              orderId: fullRefund.order.id,
              customer: {
                name: fullRefund.user.name,
              },
            },
          }
        );
      }
    } catch (error) {
      console.error(`❌ Gửi email từ chối hoàn tiền lỗi (Refund #${id}):`, error);
    }

    return result;
  }
}
