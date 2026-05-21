import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repository';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { 
  ReviewQueryType, 
  CreateReviewBodyType, 
  ModerateReviewBodyType, 
  AdminReplyBodyType 
} from './review.validate';

export const reviewController = (fastify: FastifyInstance) => {
  const repo = new ReviewRepository(fastify.db);
  const service = new ReviewService(repo);

  return {
    // ===== CREATE REVIEW (Customer) =====
    createReviewHandler: async (
      request: FastifyRequest<{ Body: CreateReviewBodyType }>,
      reply: FastifyReply
    ) => {
      const userId = (request.user as any)?.userId;
      const data = request.body;
      const result = await service.createReview(userId, data);
      return sendResponseSuccess(201, reply, 'Đánh giá sản phẩm đã được gửi thành công.', result);
    },

    // ===== GET PUBLIC APPROVED REVIEWS FOR PRODUCT (Public) =====
    getApprovedReviewsHandler: async (
      request: FastifyRequest<{ Params: { productId: string }; Querystring: { page?: number; limit?: number } }>,
      reply: FastifyReply
    ) => {
      const { productId } = request.params;
      const { page = 1, limit = 10 } = request.query;
      const result = await service.getApprovedReviews(productId, { page: Number(page), limit: Number(limit) });
      return sendResponseSuccess(200, reply, 'Danh sách đánh giá đã duyệt.', result);
    },

    // ===== GET ALL REVIEWS (Admin only) =====
    getAllReviewsHandler: async (
      request: FastifyRequest<{ Querystring: ReviewQueryType }>,
      reply: FastifyReply
    ) => {
      const query = request.query;
      const result = await service.getAllReviews(query);
      return sendResponseSuccess(200, reply, 'Danh sách đánh giá của hệ thống.', result);
    },

    // ===== GET REVIEW BY ID (Admin only) =====
    getReviewByIdHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const result = await service.getReviewById(id);
      return sendResponseSuccess(200, reply, 'Thông tin chi tiết đánh giá.', result);
    },

    // ===== MODERATE REVIEW STATUS (Admin only) =====
    moderateReviewHandler: async (
      request: FastifyRequest<{ Params: { id: string }; Body: ModerateReviewBodyType }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const data = request.body;
      const result = await service.moderateReview(id, data);
      return sendResponseSuccess(200, reply, 'Kiểm duyệt đánh giá thành công.', result);
    },

    // ===== ADMIN REPLY REVIEW (Admin only) =====
    adminReplyHandler: async (
      request: FastifyRequest<{ Params: { id: string }; Body: AdminReplyBodyType }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const userId = (request.user as any)?.userId;
      const data = request.body;
      const result = await service.adminReply(id, userId, data);
      return sendResponseSuccess(200, reply, 'Phản hồi đánh giá thành công.', result);
    },

    // ===== DELETE REVIEW (Admin only) =====
    deleteReviewHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const result = await service.deleteReview(id);
      return sendResponseSuccess(200, reply, 'Xóa đánh giá thành công.', result);
    },
  };
};
