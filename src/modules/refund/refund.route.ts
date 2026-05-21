import { FastifyInstance } from 'fastify';
import { refundController } from './refund.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { routeWithZod } from '@/utils/routeWithZod';
import {
  refundQuerySchema,
  createRefundSchema,
  approveRefundSchema,
  rejectRefundSchema,
  refundParamSchema,
} from './refund.validate';
import { REFUND_TAG, REFUND_DOCUMENTATION } from './refund.docs';

export async function refundRoutes(fastify: FastifyInstance) {
  const controller = refundController(fastify);

  // GET /api/refunds - Get all refund requests (Admin only)
  routeWithZod(fastify, {
    method: 'get',
    url: '/',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    swaggerSchema: {
      tags: [REFUND_TAG],
      summary: REFUND_DOCUMENTATION.REFUND_SUMMARIES.GET_ALL_REFUNDS,
      description: REFUND_DOCUMENTATION.REFUND_DESCRIPTIONS.GET_ALL_REFUNDS,
    },
    querySchema: refundQuerySchema,
    handler: controller.getAllRefundsHandler,
  });

  // GET /api/refunds/:id - Get detail of a refund request (Admin only)
  routeWithZod(fastify, {
    method: 'get',
    url: '/:id',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    swaggerSchema: {
      tags: [REFUND_TAG],
      summary: REFUND_DOCUMENTATION.REFUND_SUMMARIES.GET_REFUND_DETAIL,
      description: REFUND_DOCUMENTATION.REFUND_DESCRIPTIONS.GET_REFUND_DETAIL,
    },
    paramsSchema: refundParamSchema,
    handler: controller.getRefundByIdHandler,
  });

  // POST /api/refunds - Create a new refund request (Customer)
  routeWithZod(fastify, {
    method: 'post',
    url: '/',
    preHandler: [authenticate], // Customers can create
    swaggerSchema: {
      tags: [REFUND_TAG],
      summary: REFUND_DOCUMENTATION.REFUND_SUMMARIES.CREATE_REFUND,
      description: REFUND_DOCUMENTATION.REFUND_DESCRIPTIONS.CREATE_REFUND,
      body: REFUND_DOCUMENTATION.REFUND_REQUEST_BODIES.CREATE_REFUND,
    },
    bodySchema: createRefundSchema,
    handler: controller.createRefundHandler,
  });

  // PUT /api/refunds/:id/approve - Approve a refund request (Admin only)
  routeWithZod(fastify, {
    method: 'put',
    url: '/:id/approve',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    swaggerSchema: {
      tags: [REFUND_TAG],
      summary: REFUND_DOCUMENTATION.REFUND_SUMMARIES.APPROVE_REFUND,
      description: REFUND_DOCUMENTATION.REFUND_DESCRIPTIONS.APPROVE_REFUND,
      body: REFUND_DOCUMENTATION.REFUND_REQUEST_BODIES.APPROVE_REFUND,
    },
    paramsSchema: refundParamSchema,
    bodySchema: approveRefundSchema,
    handler: controller.approveRefundHandler,
  });

  // PUT /api/refunds/:id/reject - Reject a refund request (Admin only)
  routeWithZod(fastify, {
    method: 'put',
    url: '/:id/reject',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    swaggerSchema: {
      tags: [REFUND_TAG],
      summary: REFUND_DOCUMENTATION.REFUND_SUMMARIES.REJECT_REFUND,
      description: REFUND_DOCUMENTATION.REFUND_DESCRIPTIONS.REJECT_REFUND,
      body: REFUND_DOCUMENTATION.REFUND_REQUEST_BODIES.REJECT_REFUND,
    },
    paramsSchema: refundParamSchema,
    bodySchema: rejectRefundSchema,
    handler: controller.rejectRefundHandler,
  });
}
