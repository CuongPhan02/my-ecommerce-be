import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PaymentRepository } from './payment.repository';
import { PaymentService } from './payment.service';
import { CreatePaymentUrlInput } from './payment.validate';
import { OrderRepository } from '../order/order.repository';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { ENV_CONFIG } from '@/config/env';

export const paymentController = (fastify: FastifyInstance) => {
  const repo = new PaymentRepository(fastify.db);
  const orderRepo = new OrderRepository(fastify.db);
  const service = new PaymentService(repo, orderRepo);

  return {
    createPaymentUrlHandler: async (
      req: FastifyRequest<{ Body: CreatePaymentUrlInput }>,
      reply: FastifyReply
    ) => {
      // Lấy IP của Client để gửi cho VNPAY (VNPAY chỉ chấp nhận IPv4)
      const xForwardedFor = req.headers['x-forwarded-for'] as string | undefined;
      let ipAddress =
        xForwardedFor?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        '127.0.0.1';

      // Chuẩn hóa địa chỉ IPv6 thành IPv4 cho môi trường local
      if (ipAddress === '::1' || ipAddress === '::') {
        ipAddress = '127.0.0.1';
      } else if (ipAddress.startsWith('::ffff:')) {
        ipAddress = ipAddress.substring(7);
      }

      const paymentUrl = await service.createPaymentUrl(req.body, ipAddress);
      return sendResponseSuccess(201, reply, 'Payment URL created successfully', {
        paymentUrl,
      });
    },

    vnpayReturnHandler: async (
      req: FastifyRequest<{ Querystring: any }>,
      reply: FastifyReply
    ) => {
      const result = await service.handleReturn(req.query as any);

      // Điều hướng về giao diện Frontend thông báo kết quả
      const feUrl = new URL(`${ENV_CONFIG.URL_REDIRECT_FE}/checkout/result`);
      feUrl.searchParams.append('orderId', result.orderId);
      feUrl.searchParams.append('success', result.success.toString());
      feUrl.searchParams.append('responseCode', result.responseCode);

      return reply.redirect(feUrl.toString());
    },

    vnpayIpnHandler: async (
      req: FastifyRequest<{ Querystring: any }>,
      reply: FastifyReply
    ) => {
      const response = await service.handleIpn(req.query as any);
      return reply.status(200).send(response);
    },
  };
};
