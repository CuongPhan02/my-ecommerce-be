import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { GetOrdersQuery, UpdateOrderInput, CreateOrderInput } from './order.validate';

export const orderController = (fastify: FastifyInstance) => {
  const repo = new OrderRepository(fastify.db);
  const service = new OrderService(repo);

  return {
    // ===== ADMIN: Lấy tất cả đơn hàng =====
    getAllOrdersHandler: async (
      req: FastifyRequest<{ Querystring: GetOrdersQuery }>,
      reply: FastifyReply
    ) => {
      const filter: GetOrdersQuery = {
        page: Number(req.query?.page) || 1,
        limit: Number(req.query?.limit) || 10,
        search: req.query?.search,
        status: req.query?.status,
        paymentStatus: req.query?.paymentStatus,
        sort: req.query?.sort ?? 'newest',
      };
      const result = await service.getAllOrders(filter);
      return sendResponseSuccess(200, reply, 'Get all orders success', result);
    },

    // ===== ADMIN: Lấy chi tiết đơn hàng =====
    getOrderByIdHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getOrderById(req.params.id);
      return sendResponseSuccess(200, reply, 'Get order detail success', result);
    },

    // ===== ADMIN: Cập nhật trạng thái đơn hàng =====
    updateOrderHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: UpdateOrderInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.updateOrder(req.params.id, req.body);
      return sendResponseSuccess(200, reply, 'Update order success', result);
    },

    // ===== USER: Lấy đơn hàng của tôi =====
    getMyOrdersHandler: async (
      req: FastifyRequest<{ Querystring?: { page?: number; limit?: number } }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user?.id;
      const page = Number(req.query?.page) || 1;
      const limit = Number(req.query?.limit) || 10;
      const result = await service.getMyOrders(userId, page, limit);
      return sendResponseSuccess(200, reply, 'Get my orders success', result);
    },

    // ===== USER: Lấy chi tiết đơn hàng của tôi =====
    getMyOrderByIdHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user?.id;
      const result = await service.getMyOrderById(req.params.id, userId);
      return sendResponseSuccess(200, reply, 'Get my order detail success', result);
    },

    // ===== USER: ĐẶT HÀNG MỚI (CHECKOUT) =====
    createOrderHandler: async (
      req: FastifyRequest<{ Body: CreateOrderInput }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user?.id;
      const result = await service.createOrder(userId, req.body);
      return sendResponseSuccess(201, reply, 'Đặt hàng thành công', result);
    },

    // ===== PUBLIC: Theo dõi đơn hàng (Không cần đăng nhập) =====
    trackOrderHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getOrderById(req.params.id);
      return sendResponseSuccess(200, reply, 'Theo dõi đơn hàng thành công', result);
    },
  };
};
