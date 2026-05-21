import { FastifyInstance } from 'fastify';
import { inventoryController } from './inventory.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { routeWithZod } from '@/utils/routeWithZod';
import {
  inventoryQuerySchema,
  importStockSchema,
  adjustStockSchema,
  inventoryHistoryQuerySchema,
} from './inventory.validate';
import { INVENTORY_TAG, INVENTORY_DOCUMENTATION } from './inventory.docs';

export async function inventoryRoutes(fastify: FastifyInstance) {
  const controller = inventoryController(fastify);

  // GET /api/inventory - Get list of product variant stock (Admin/Inventory only)
  routeWithZod(fastify, {
    method: 'get',
    url: '/',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'INVENTORY'])],
    disableValidator: true,
    swaggerSchema: {
      tags: [INVENTORY_TAG],
      summary: INVENTORY_DOCUMENTATION.INVENTORY_SUMMARIES.GET_STOCK_LIST,
      description: INVENTORY_DOCUMENTATION.INVENTORY_DESCRIPTIONS.GET_STOCK_LIST,
    },
    querySchema: inventoryQuerySchema,
    handler: controller.getVariantStockListHandler,
  });

  // POST /api/inventory/import - Create stock import voucher (Admin/Inventory only)
  routeWithZod(fastify, {
    method: 'post',
    url: '/import',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'INVENTORY'])],
    disableValidator: true,
    swaggerSchema: {
      tags: [INVENTORY_TAG],
      summary: INVENTORY_DOCUMENTATION.INVENTORY_SUMMARIES.IMPORT_STOCK,
      description: INVENTORY_DOCUMENTATION.INVENTORY_DESCRIPTIONS.IMPORT_STOCK,
      body: INVENTORY_DOCUMENTATION.INVENTORY_REQUEST_BODIES.IMPORT_STOCK,
    },
    bodySchema: importStockSchema,
    handler: controller.importStockHandler,
  });

  // POST /api/inventory/adjust - Directly adjust variant stock quantity (Admin/Inventory only)
  routeWithZod(fastify, {
    method: 'post',
    url: '/adjust',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'INVENTORY'])],
    disableValidator: true,
    swaggerSchema: {
      tags: [INVENTORY_TAG],
      summary: INVENTORY_DOCUMENTATION.INVENTORY_SUMMARIES.ADJUST_STOCK,
      description: INVENTORY_DOCUMENTATION.INVENTORY_DESCRIPTIONS.ADJUST_STOCK,
      body: INVENTORY_DOCUMENTATION.INVENTORY_REQUEST_BODIES.ADJUST_STOCK,
    },
    bodySchema: adjustStockSchema,
    handler: controller.adjustStockHandler,
  });

  // GET /api/inventory/transactions - Get inventory transactions log (Admin/Inventory only)
  routeWithZod(fastify, {
    method: 'get',
    url: '/transactions',
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'INVENTORY'])],
    disableValidator: true,
    swaggerSchema: {
      tags: [INVENTORY_TAG],
      summary: INVENTORY_DOCUMENTATION.INVENTORY_SUMMARIES.GET_TRANSACTIONS,
      description: INVENTORY_DOCUMENTATION.INVENTORY_DESCRIPTIONS.GET_TRANSACTIONS,
    },
    querySchema: inventoryHistoryQuerySchema,
    handler: controller.getTransactionsHandler,
  });
}
