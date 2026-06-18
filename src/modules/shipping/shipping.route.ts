import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { shippingController } from './shipping.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import {
  createShippingSchema,
  updateShippingSchema,
  deleteShippingSchema,
} from './shipping.validate';
import { SHIPPING_TAG, SHIPPING_DOCUMENTATION } from './shipping.docs';

export const shippingRoutes = async (fastify: FastifyInstance) => {
  const controller = shippingController(fastify);

  // Admin: Lấy tất cả (kể cả bị disable)
  fastify.get(
    '/',
    {
      preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
      schema: {
        tags: [SHIPPING_TAG],
        summary: SHIPPING_DOCUMENTATION.SHIPPING_SUMMARIES.GET_ALL,
        description: SHIPPING_DOCUMENTATION.SHIPPING_DESCRIPTIONS.GET_ALL,
      },
    },
    controller.getAllMethodsHandler
  );

  // Public: Lấy phương thức đang hoạt động
  fastify.get(
    '/active',
    {
      schema: {
        tags: [SHIPPING_TAG],
        summary: SHIPPING_DOCUMENTATION.SHIPPING_SUMMARIES.GET_ACTIVE,
        description: SHIPPING_DOCUMENTATION.SHIPPING_DESCRIPTIONS.GET_ACTIVE,
      },
    },
    controller.getActiveMethodsHandler
  );

  fastify.post(
    '/',
    {
      preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
      schema: {
        tags: [SHIPPING_TAG],
        summary: SHIPPING_DOCUMENTATION.SHIPPING_SUMMARIES.CREATE,
        description: SHIPPING_DOCUMENTATION.SHIPPING_DESCRIPTIONS.CREATE,
        body: createShippingSchema,
      },
    },
    controller.createMethodHandler
  );

  fastify.put(
    '/:id',
    {
      preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
      schema: {
        tags: [SHIPPING_TAG],
        summary: SHIPPING_DOCUMENTATION.SHIPPING_SUMMARIES.UPDATE,
        description: SHIPPING_DOCUMENTATION.SHIPPING_DESCRIPTIONS.UPDATE,
        params: z.object({ id: z.string() }),
        body: updateShippingSchema,
      },
    },
    controller.updateMethodHandler
  );

  fastify.delete(
    '/:id',
    {
      preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
      schema: {
        tags: [SHIPPING_TAG],
        summary: SHIPPING_DOCUMENTATION.SHIPPING_SUMMARIES.DELETE,
        description: SHIPPING_DOCUMENTATION.SHIPPING_DESCRIPTIONS.DELETE,
        params: z.object({ id: z.string() }),
      },
    },
    controller.deleteMethodHandler
  );
};
