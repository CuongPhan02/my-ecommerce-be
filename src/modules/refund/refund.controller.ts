import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RefundService } from './refund.service';
import { RefundRepository } from './refund.repository';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { RefundQueryType, CreateRefundType, ApproveRefundType, RejectRefundType } from './refund.validate';

export const refundController = (fastify: FastifyInstance) => {
  const repo = new RefundRepository(fastify.db);
  const service = new RefundService(repo);

  return {
    // ===== GET ALL REFUNDS (Admin only) =====
    getAllRefundsHandler: async (
      request: FastifyRequest<{ Querystring: RefundQueryType }>,
      reply: FastifyReply
    ) => {
      const query = request.query;
      const result = await service.getAllRefunds(query);
      return sendResponseSuccess(200, reply, 'Refund requests fetched successfully', result);
    },

    // ===== GET REFUND DETAIL (Admin only) =====
    getRefundByIdHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const result = await service.getRefundById(id);
      return sendResponseSuccess(200, reply, 'Refund request details fetched successfully', result);
    },

    // ===== CREATE REFUND REQUEST (Customer) =====
    createRefundHandler: async (
      request: FastifyRequest<{ Body: CreateRefundType }>,
      reply: FastifyReply
    ) => {
      const userId = (request as any).user?.id;
      const data = request.body;
      const result = await service.createRefund(userId, data);
      return sendResponseSuccess(201, reply, 'Refund request created successfully', result);
    },

    // ===== APPROVE REFUND REQUEST (Admin only) =====
    approveRefundHandler: async (
      request: FastifyRequest<{ Params: { id: string }; Body: ApproveRefundType }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const data = request.body;
      const result = await service.approveRefund(id, data);
      return sendResponseSuccess(200, reply, 'Refund request approved successfully', result);
    },

    // ===== REJECT REFUND REQUEST (Admin only) =====
    rejectRefundHandler: async (
      request: FastifyRequest<{ Params: { id: string }; Body: RejectRefundType }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const data = request.body;
      const result = await service.rejectRefund(id, data);
      return sendResponseSuccess(200, reply, 'Refund request rejected successfully', result);
    },
  };
};
