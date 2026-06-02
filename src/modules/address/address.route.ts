import { FastifyInstance } from 'fastify';
import { addressController } from './address.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { routeWithZod } from '@/utils/routeWithZod';
import { createAddressSchema, updateAddressSchema } from './address.validation';

export async function addressRoutes(fastify: FastifyInstance) {
  const controller = addressController(fastify);

  // All address routes require authentication
  fastify.addHook('preHandler', authenticate);

  // GET /api/addresses/me - Get current user's addresses
  routeWithZod(fastify, {
    method: 'get',
    url: '/me',
    handler: controller.getMyAddressesHandler,
  });

  // POST /api/addresses - Create new address
  routeWithZod(fastify, {
    method: 'post',
    url: '/',
    bodySchema: createAddressSchema,
    handler: controller.createAddressHandler,
  });

  // PUT /api/addresses/:id - Update address
  routeWithZod(fastify, {
    method: 'put',
    url: '/:id',
    bodySchema: updateAddressSchema,
    handler: controller.updateAddressHandler,
  });

  // DELETE /api/addresses/:id - Delete address
  routeWithZod(fastify, {
    method: 'delete',
    url: '/:id',
    handler: controller.deleteAddressHandler,
  });

  // PATCH /api/addresses/:id/set-default - Set default address
  routeWithZod(fastify, {
    method: 'patch',
    url: '/:id/set-default',
    handler: controller.setDefaultAddressHandler,
  });
}
