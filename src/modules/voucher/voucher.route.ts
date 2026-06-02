import { FastifyInstance } from 'fastify';
import { routeWithZod } from '@/utils/routeWithZod';
import { authenticate } from '@/middleware/auth.middleware';
import { ROLE_NAME } from '@/constants';
import { voucherController } from './voucher.controller';
import {
  createVoucherSchema,
  updateVoucherSchema,
  getVouchersQuerySchema,
  getVoucherSchema,
  deleteVoucherSchema,
  toggleVoucherStatusSchema,
} from './voucher.validate';
import { VOUCHER_TAG, VOUCHER_DOCUMENTATION } from './voucher.docs';

export const voucherRoutes = async (fastify: FastifyInstance) => {
  const controller = voucherController(fastify);

  routeWithZod(fastify, {
    url: '/public',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: 'Get active vouchers for users',
      description: 'Retrieve all currently active and non-expired vouchers',
      tags: [VOUCHER_TAG],
    },
    handler: controller.getPublicVouchersHandler,
  });

  routeWithZod(fastify, {
    url: '/apply',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      summary: 'Apply a voucher code',
      description: 'Validate a voucher code and check if it can be applied',
      tags: [VOUCHER_TAG],
      body: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          orderValue: { type: 'number' },
        },
        required: ['code', 'orderValue'],
      },
    },
    preHandler: [authenticate],
    handler: controller.applyVoucherHandler,
  });

  routeWithZod(fastify, {
    url: '/',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      body: VOUCHER_DOCUMENTATION.VOUCHER_REQUEST_BODIES.CREATE_VOUCHER,
      summary: VOUCHER_DOCUMENTATION.VOUCHER_SUMMARIES.CREATE_VOUCHER,
      description: VOUCHER_DOCUMENTATION.VOUCHER_DESCRIPTIONS.CREATE_VOUCHER,
      tags: [VOUCHER_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    bodySchema: createVoucherSchema,
    handler: controller.createVoucherHandler,
  });

  routeWithZod(fastify, {
    url: '/',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: VOUCHER_DOCUMENTATION.VOUCHER_SUMMARIES.GET_VOUCHERS,
      description: VOUCHER_DOCUMENTATION.VOUCHER_DESCRIPTIONS.GET_VOUCHERS,
      tags: [VOUCHER_TAG],
      querystring: VOUCHER_DOCUMENTATION.VOUCHER_QUERYSTRING,
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    querySchema: getVouchersQuerySchema,
    handler: controller.getVouchersHandler,
  });

  routeWithZod(fastify, {
    url: '/:id',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: VOUCHER_DOCUMENTATION.VOUCHER_SUMMARIES.GET_VOUCHER_BY_ID,
      description: VOUCHER_DOCUMENTATION.VOUCHER_DESCRIPTIONS.GET_VOUCHER_BY_ID,
      tags: [VOUCHER_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    paramsSchema: getVoucherSchema,
    handler: controller.getVoucherByIdHandler,
  });

  routeWithZod(fastify, {
    url: '/:id',
    method: 'put',
    disableValidator: true,
    swaggerSchema: {
      body: VOUCHER_DOCUMENTATION.VOUCHER_REQUEST_BODIES.UPDATE_VOUCHER,
      summary: VOUCHER_DOCUMENTATION.VOUCHER_SUMMARIES.UPDATE_VOUCHER,
      description: VOUCHER_DOCUMENTATION.VOUCHER_DESCRIPTIONS.UPDATE_VOUCHER,
      tags: [VOUCHER_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    paramsSchema: getVoucherSchema,
    bodySchema: updateVoucherSchema,
    handler: controller.updateVoucherHandler,
  });

  routeWithZod(fastify, {
    url: '/:id',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      summary: VOUCHER_DOCUMENTATION.VOUCHER_SUMMARIES.DELETE_VOUCHER,
      description: VOUCHER_DOCUMENTATION.VOUCHER_DESCRIPTIONS.DELETE_VOUCHER,
      tags: [VOUCHER_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    paramsSchema: deleteVoucherSchema,
    handler: controller.deleteVoucherHandler,
  });

  routeWithZod(fastify, {
    url: '/:id/toggle',
    method: 'patch',
    disableValidator: true,
    swaggerSchema: {
      body: VOUCHER_DOCUMENTATION.VOUCHER_REQUEST_BODIES.TOGGLE_STATUS,
      summary: VOUCHER_DOCUMENTATION.VOUCHER_SUMMARIES.TOGGLE_STATUS,
      description: VOUCHER_DOCUMENTATION.VOUCHER_DESCRIPTIONS.TOGGLE_STATUS,
      tags: [VOUCHER_TAG],
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.ADMIN, ROLE_NAME.SUPER_ADMIN],
    paramsSchema: getVoucherSchema,
    bodySchema: toggleVoucherStatusSchema,
    handler: controller.toggleVoucherStatusHandler,
  });
};
