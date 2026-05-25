import { FastifyInstance } from 'fastify';
import { reviewController } from './review.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { routeWithZod } from '@/utils/routeWithZod';
import {
  reviewQuerySchema,
  createReviewSchema,
  moderateReviewSchema,
  adminReplySchema,
  reviewParamSchema,
  reviewProductParamSchema,
} from './review.validate';
import { REVIEW_TAG, REVIEW_DOCUMENTATION } from './review.docs';

export async function reviewRoutes(fastify: FastifyInstance) {
  const controller = reviewController(fastify);

  // GET /api/reviews - Get all reviews (Admin only)
  routeWithZod(fastify, {
    method: 'get',
    url: '/',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    disableValidator: true,
    swaggerSchema: {
      tags: [REVIEW_TAG],
      summary: REVIEW_DOCUMENTATION.REVIEW_SUMMARIES.GET_ADMIN_REVIEWS,
      description: REVIEW_DOCUMENTATION.REVIEW_DESCRIPTIONS.GET_ADMIN_REVIEWS,
    },
    querySchema: reviewQuerySchema,
    handler: controller.getAllReviewsHandler,
  });

  // GET /api/reviews/:id - Get detail of a review (Admin only)
  routeWithZod(fastify, {
    method: 'get',
    url: '/:id',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    disableValidator: true,
    swaggerSchema: {
      tags: [REVIEW_TAG],
      summary: REVIEW_DOCUMENTATION.REVIEW_SUMMARIES.GET_REVIEW_DETAIL,
      description: REVIEW_DOCUMENTATION.REVIEW_DESCRIPTIONS.GET_REVIEW_DETAIL,
    },
    paramsSchema: reviewParamSchema,
    handler: controller.getReviewByIdHandler,
  });

  // POST /api/reviews - Create a new review (Customer)
  routeWithZod(fastify, {
    method: 'post',
    url: '/',
    preHandler: [authenticate],
    disableValidator: true,
    swaggerSchema: {
      tags: [REVIEW_TAG],
      summary: REVIEW_DOCUMENTATION.REVIEW_SUMMARIES.SUBMIT_REVIEW,
      description: REVIEW_DOCUMENTATION.REVIEW_DESCRIPTIONS.SUBMIT_REVIEW,
      body: REVIEW_DOCUMENTATION.REVIEW_REQUEST_BODIES.SUBMIT_REVIEW,
    },
    bodySchema: createReviewSchema,
    handler: controller.createReviewHandler,
  });

  // GET /api/reviews/product/:productId - Get public approved reviews for a product (Public)
  routeWithZod(fastify, {
    method: 'get',
    url: '/product/:productId',
    disableValidator: true,
    swaggerSchema: {
      tags: [REVIEW_TAG],
      summary: REVIEW_DOCUMENTATION.REVIEW_SUMMARIES.GET_PRODUCT_REVIEWS,
      description: REVIEW_DOCUMENTATION.REVIEW_DESCRIPTIONS.GET_PRODUCT_REVIEWS,
    },
    paramsSchema: reviewProductParamSchema,
    handler: controller.getApprovedReviewsHandler,
  });

  // PUT /api/reviews/:id/moderate - Moderate review status (Admin only)
  routeWithZod(fastify, {
    method: 'put',
    url: '/:id/moderate',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    disableValidator: true,
    swaggerSchema: {
      tags: [REVIEW_TAG],
      summary: REVIEW_DOCUMENTATION.REVIEW_SUMMARIES.MODERATE_STATUS,
      description: REVIEW_DOCUMENTATION.REVIEW_DESCRIPTIONS.MODERATE_STATUS,
      body: REVIEW_DOCUMENTATION.REVIEW_REQUEST_BODIES.MODERATE_STATUS,
    },
    paramsSchema: reviewParamSchema,
    bodySchema: moderateReviewSchema,
    handler: controller.moderateReviewHandler,
  });

  // PUT /api/reviews/:id/reply - Admin reply to review (Admin only)
  routeWithZod(fastify, {
    method: 'put',
    url: '/:id/reply',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    disableValidator: true,
    swaggerSchema: {
      tags: [REVIEW_TAG],
      summary: REVIEW_DOCUMENTATION.REVIEW_SUMMARIES.ADMIN_REPLY,
      description: REVIEW_DOCUMENTATION.REVIEW_DESCRIPTIONS.ADMIN_REPLY,
      body: REVIEW_DOCUMENTATION.REVIEW_REQUEST_BODIES.ADMIN_REPLY,
    },
    paramsSchema: reviewParamSchema,
    bodySchema: adminReplySchema,
    handler: controller.adminReplyHandler,
  });

  // DELETE /api/reviews/:id - Delete a review (Admin only)
  routeWithZod(fastify, {
    method: 'delete',
    url: '/:id',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    disableValidator: true,
    swaggerSchema: {
      tags: [REVIEW_TAG],
      summary: REVIEW_DOCUMENTATION.REVIEW_SUMMARIES.DELETE_REVIEW,
      description: REVIEW_DOCUMENTATION.REVIEW_DESCRIPTIONS.DELETE_REVIEW,
    },
    paramsSchema: reviewParamSchema,
    handler: controller.deleteReviewHandler,
  });
}
