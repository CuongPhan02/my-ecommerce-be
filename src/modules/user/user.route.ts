import { FastifyInstance } from 'fastify';
import { userController } from './user.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { routeWithZod } from '@/utils/routeWithZod';
import {
  userQuerySchema,
  createUserSchema,
  updateUserSchema,
  userParamSchema,
  bulkDeleteSchema,
} from './user.validation';
import { USER_TAG, USER_DOCUMENTATION } from './user.docs';

export async function userRoutes(fastify: FastifyInstance) {
  const controller = userController(fastify);

  // Apply Auth and Admin Roles to all routes in this module
  const adminAuth = [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])];

  // GET /api/users - Get all users
  routeWithZod(fastify, {
    method: 'get',
    url: '/',
    disableValidator: true,
    preHandler: adminAuth,
    swaggerSchema: {
      tags: [USER_TAG],
      summary: USER_DOCUMENTATION.USER_SUMMARIES.GET_ALL_USERS,
      description: USER_DOCUMENTATION.USER_DESCRIPTIONS.GET_ALL_USERS,
    },
    querySchema: userQuerySchema,
    handler: controller.getAllUsersHandler,
  });

  // GET /api/users/:id - Get user detail
  routeWithZod(fastify, {
    method: 'get',
    url: '/:id',
    disableValidator: true,
    preHandler: adminAuth,
    swaggerSchema: {
      tags: [USER_TAG],
      summary: USER_DOCUMENTATION.USER_SUMMARIES.GET_USER_DETAIL,
      description: USER_DOCUMENTATION.USER_DESCRIPTIONS.GET_USER_DETAIL,
    },
    paramsSchema: userParamSchema,
    handler: controller.getUserByIdHandler,
  });

  // POST /api/users - Create new user
  routeWithZod(fastify, {
    method: 'post',
    url: '/',
    disableValidator: true,
    preHandler: adminAuth,
    swaggerSchema: {
      tags: [USER_TAG],
      summary: USER_DOCUMENTATION.USER_SUMMARIES.CREATE_USER,
      description: USER_DOCUMENTATION.USER_DESCRIPTIONS.CREATE_USER,
      body: USER_DOCUMENTATION.USER_REQUEST_BODIES.CREATE_USER,
    },
    bodySchema: createUserSchema,
    handler: controller.createUserHandler,
  });

  // PUT /api/users/:id - Update user
  routeWithZod(fastify, {
    method: 'put',
    url: '/:id',
    disableValidator: true,
    preHandler: adminAuth,
    swaggerSchema: {
      tags: [USER_TAG],
      summary: USER_DOCUMENTATION.USER_SUMMARIES.UPDATE_USER,
      description: USER_DOCUMENTATION.USER_DESCRIPTIONS.UPDATE_USER,
      body: USER_DOCUMENTATION.USER_REQUEST_BODIES.UPDATE_USER,
    },
    paramsSchema: userParamSchema,
    bodySchema: updateUserSchema,
    handler: controller.updateUserHandler,
  });

  // DELETE /api/users/:id - Delete user
  routeWithZod(fastify, {
    method: 'delete',
    url: '/:id',
    disableValidator: true,
    preHandler: adminAuth,
    swaggerSchema: {
      tags: [USER_TAG],
      summary: USER_DOCUMENTATION.USER_SUMMARIES.DELETE_USER,
      description: USER_DOCUMENTATION.USER_DESCRIPTIONS.DELETE_USER,
    },
    paramsSchema: userParamSchema,
    handler: controller.deleteUserHandler,
  });

  // POST /api/users/bulk-delete - Bulk delete users
  routeWithZod(fastify, {
    method: 'post',
    url: '/bulk-delete',
    disableValidator: true,
    preHandler: adminAuth,
    swaggerSchema: {
      tags: [USER_TAG],
      summary: USER_DOCUMENTATION.USER_SUMMARIES.BULK_DELETE_USERS,
      description: USER_DOCUMENTATION.USER_DESCRIPTIONS.BULK_DELETE_USERS,
      body: USER_DOCUMENTATION.USER_REQUEST_BODIES.BULK_DELETE,
    },
    bodySchema: bulkDeleteSchema,
    handler: controller.bulkDeleteUsersHandler,
  });
}
