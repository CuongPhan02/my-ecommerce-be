import { routeWithZod } from '@/utils/routeWithZod';
import { FastifyInstance } from 'fastify';
import { authenticate } from '@/middleware/auth.middleware';
import { ROLE_NAME } from '@/constants';
import {
  ORDER_TAG,
  ORDER_PAGINATION_QUERYSTRING,
  ORDER_DOCUMENTATION,
} from './order.docs';
import { updateOrderSchema, createOrderSchema } from './order.validate';
import { orderController } from './order.controller';

export const orderRoutes = (fastify: FastifyInstance) => {
  const controller = orderController(fastify);

  // ======= ADMIN: GET ALL ORDERS (Base: /api/orders) ======= //
  routeWithZod(fastify, {
    url: '/',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: ORDER_DOCUMENTATION.ORDER_SUMMARIES.GET_ALL_ORDERS,
      description: ORDER_DOCUMENTATION.ORDER_DESCRIPTIONS.GET_ALL_ORDERS,
      tags: [ORDER_TAG],
      querystring: ORDER_PAGINATION_QUERYSTRING,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.getAllOrdersHandler,
  });

  // ======= ADMIN: GET ORDER BY ID ======= //
  routeWithZod(fastify, {
    url: '/:id',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: ORDER_DOCUMENTATION.ORDER_SUMMARIES.GET_ORDER_BY_ID,
      description: ORDER_DOCUMENTATION.ORDER_DESCRIPTIONS.GET_ORDER_BY_ID,
      tags: [ORDER_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    handler: controller.getOrderByIdHandler,
  });

  // ======= ADMIN: UPDATE ORDER ======= //
  routeWithZod(fastify, {
    url: '/:id',
    method: 'put',
    disableValidator: true,
    swaggerSchema: {
      body: ORDER_DOCUMENTATION.ORDER_REQUEST_BODIES.UPDATE_ORDER,
      summary: ORDER_DOCUMENTATION.ORDER_SUMMARIES.UPDATE_ORDER,
      description: ORDER_DOCUMENTATION.ORDER_DESCRIPTIONS.UPDATE_ORDER,
      tags: [ORDER_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: updateOrderSchema,
    handler: controller.updateOrderHandler,
  });

  // ======= USER: GET MY ORDERS ======= //
  routeWithZod(fastify, {
    url: '/my-orders',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: ORDER_DOCUMENTATION.ORDER_SUMMARIES.GET_MY_ORDERS,
      description: ORDER_DOCUMENTATION.ORDER_DESCRIPTIONS.GET_MY_ORDERS,
      tags: [ORDER_TAG],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', default: 1 },
          limit: { type: 'number', default: 10 },
        },
      },
    },
    preHandler: [authenticate],
    handler: controller.getMyOrdersHandler,
  });

  // ======= USER: GET MY ORDER BY ID ======= //
  routeWithZod(fastify, {
    url: '/my-orders/:id',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: ORDER_DOCUMENTATION.ORDER_SUMMARIES.GET_MY_ORDER_BY_ID,
      description: ORDER_DOCUMENTATION.ORDER_DESCRIPTIONS.GET_MY_ORDER_BY_ID,
      tags: [ORDER_TAG],
    },
    preHandler: [authenticate],
    handler: controller.getMyOrderByIdHandler,
  });

  // ======= USER: ĐẶT HÀNG MỚI (CHECKOUT) ======= //
  routeWithZod(fastify, {
    url: '/',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      body: ORDER_DOCUMENTATION.ORDER_REQUEST_BODIES.CREATE_ORDER,
      summary: ORDER_DOCUMENTATION.ORDER_SUMMARIES.CREATE_ORDER,
      description: ORDER_DOCUMENTATION.ORDER_DESCRIPTIONS.CREATE_ORDER,
      tags: [ORDER_TAG],
      security: [{ bearerAuth: [] }],
    },
    preHandler: [authenticate],
    bodySchema: createOrderSchema,
    handler: controller.createOrderHandler,
  });

  // ======= PUBLIC: THEO DÕI ĐƠN HÀNG (KHÔNG CẦN ĐĂNG NHẬP) ======= //
  routeWithZod(fastify, {
    url: '/track/:id',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: ORDER_DOCUMENTATION.ORDER_SUMMARIES.TRACK_ORDER,
      description: ORDER_DOCUMENTATION.ORDER_DESCRIPTIONS.TRACK_ORDER,
      tags: [ORDER_TAG],
    },
    handler: controller.trackOrderHandler,
  });
};
