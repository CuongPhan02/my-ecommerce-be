import { routeWithZod } from '@/utils/routeWithZod';
import { FastifyInstance } from 'fastify';
import { authenticate } from '@/middleware/auth.middleware';
import {
  CART_TAG,
  CART_DOCUMENTATION,
} from './cart.docs';
import { addToCartSchema, updateCartItemSchema } from './cart.validate';
import { cartController } from './cart.controller';

export const cartRoutes = (fastify: FastifyInstance) => {
  const controller = cartController(fastify);

  // ======= GET CART ======= //
  routeWithZod(fastify, {
    url: '/',
    method: 'get',
    disableValidator: true,
    swaggerSchema: {
      summary: CART_DOCUMENTATION.CART_SUMMARIES.GET_CART,
      description: CART_DOCUMENTATION.CART_DESCRIPTIONS.GET_CART,
      tags: [CART_TAG],
    },
    preHandler: [authenticate],
    handler: controller.getCartHandler,
  });

  // ======= ADD ITEM TO CART ======= //
  routeWithZod(fastify, {
    url: '/items',
    method: 'post',
    disableValidator: true,
    swaggerSchema: {
      body: CART_DOCUMENTATION.CART_REQUEST_BODIES.ADD_TO_CART,
      summary: CART_DOCUMENTATION.CART_SUMMARIES.ADD_TO_CART,
      description: CART_DOCUMENTATION.CART_DESCRIPTIONS.ADD_TO_CART,
      tags: [CART_TAG],
    },
    preHandler: [authenticate],
    bodySchema: addToCartSchema,
    handler: controller.addItemToCartHandler,
  });

  // ======= UPDATE ITEM QUANTITY ======= //
  routeWithZod(fastify, {
    url: '/items/:itemId',
    method: 'put',
    disableValidator: true,
    swaggerSchema: {
      body: CART_DOCUMENTATION.CART_REQUEST_BODIES.UPDATE_ITEM,
      summary: CART_DOCUMENTATION.CART_SUMMARIES.UPDATE_ITEM,
      description: CART_DOCUMENTATION.CART_DESCRIPTIONS.UPDATE_ITEM,
      tags: [CART_TAG],
    },
    preHandler: [authenticate],
    bodySchema: updateCartItemSchema,
    handler: controller.updateItemQuantityHandler,
  });

  // ======= REMOVE ITEM FROM CART ======= //
  routeWithZod(fastify, {
    url: '/items/:itemId',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      summary: CART_DOCUMENTATION.CART_SUMMARIES.REMOVE_ITEM,
      description: CART_DOCUMENTATION.CART_DESCRIPTIONS.REMOVE_ITEM,
      tags: [CART_TAG],
    },
    preHandler: [authenticate],
    handler: controller.removeItemFromCartHandler,
  });

  // ======= CLEAR ALL ITEMS ======= //
  routeWithZod(fastify, {
    url: '/clear',
    method: 'delete',
    disableValidator: true,
    swaggerSchema: {
      summary: CART_DOCUMENTATION.CART_SUMMARIES.CLEAR_CART,
      description: CART_DOCUMENTATION.CART_DESCRIPTIONS.CLEAR_CART,
      tags: [CART_TAG],
    },
    preHandler: [authenticate],
    handler: controller.clearCartHandler,
  });
};
