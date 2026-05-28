import { FastifyInstance } from 'fastify';
import { routeWithZod } from '@/utils/routeWithZod';
import { authenticate } from '@/middleware/auth.middleware';
import { paymentController } from './payment.controller';
import { createPaymentUrlSchema, vnpayQuerySchema } from './payment.validate';
import { PAYMENT_TAG, PAYMENT_DOCUMENTATION } from './payment.docs';

export const paymentRoutes = (fastify: FastifyInstance) => {
  const controller = paymentController(fastify);

  // ======= USER: TẠO URL THANH TOÁN VNPAY ======= //
  routeWithZod(fastify, {
    url: '/create-payment-url',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      body: PAYMENT_DOCUMENTATION.PAYMENT_REQUEST_BODIES.CREATE_PAYMENT_URL,
      summary: PAYMENT_DOCUMENTATION.PAYMENT_SUMMARIES.CREATE_PAYMENT_URL,
      description: PAYMENT_DOCUMENTATION.PAYMENT_DESCRIPTIONS.CREATE_PAYMENT_URL,
      tags: [PAYMENT_TAG],
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    bodySchema: createPaymentUrlSchema,
    handler: controller.createPaymentUrlHandler,
  });

  // ======= PUBLIC: VNPAY RETURN REDIRECT ======= //
  routeWithZod(fastify, {
    url: '/vnpay-return',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: PAYMENT_DOCUMENTATION.PAYMENT_SUMMARIES.VNPAY_RETURN,
      description: PAYMENT_DOCUMENTATION.PAYMENT_DESCRIPTIONS.VNPAY_RETURN,
      tags: [PAYMENT_TAG],
    },
    querySchema: vnpayQuerySchema,
    handler: controller.vnpayReturnHandler,
  });

  // ======= PUBLIC: VNPAY IPN WEBHOOK ======= //
  routeWithZod(fastify, {
    url: '/vnpay-ipn',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: PAYMENT_DOCUMENTATION.PAYMENT_SUMMARIES.VNPAY_IPN,
      description: PAYMENT_DOCUMENTATION.PAYMENT_DESCRIPTIONS.VNPAY_IPN,
      tags: [PAYMENT_TAG],
    },
    querySchema: vnpayQuerySchema,
    handler: controller.vnpayIpnHandler,
  });
};
