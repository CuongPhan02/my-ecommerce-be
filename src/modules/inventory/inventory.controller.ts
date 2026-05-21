import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { sendResponseSuccess } from '@/utils/sendResponse';
import {
  InventoryQueryType,
  ImportStockType,
  AdjustStockType,
  InventoryHistoryQueryType,
} from './inventory.validate';

export const inventoryController = (fastify: FastifyInstance) => {
  const repo = new InventoryRepository(fastify.db);
  const service = new InventoryService(repo);

  return {
    getVariantStockListHandler: async (
      request: FastifyRequest<{ Querystring: InventoryQueryType }>,
      reply: FastifyReply
    ) => {
      const query = request.query;
      const result = await service.getVariantStockList(query);
      return sendResponseSuccess(200, reply, 'Lấy danh sách tồn kho thành công', result);
    },

    importStockHandler: async (
      request: FastifyRequest<{ Body: ImportStockType }>,
      reply: FastifyReply
    ) => {
      const userId = (request.user as any)?.userId;
      const data = request.body;
      const result = await service.importStock(userId, data);
      return sendResponseSuccess(201, reply, 'Lập phiếu nhập hàng thành công', result);
    },

    adjustStockHandler: async (
      request: FastifyRequest<{ Body: AdjustStockType }>,
      reply: FastifyReply
    ) => {
      const userId = (request.user as any)?.userId;
      const data = request.body;
      const result = await service.adjustStock(userId, data);
      return sendResponseSuccess(200, reply, 'Cân đối kho hàng thành công', result);
    },

    getTransactionsHandler: async (
      request: FastifyRequest<{ Querystring: InventoryHistoryQueryType }>,
      reply: FastifyReply
    ) => {
      const query = request.query;
      const result = await service.getTransactions(query);
      return sendResponseSuccess(200, reply, 'Lấy lịch sử giao dịch kho thành công', result);
    },
  };
};

