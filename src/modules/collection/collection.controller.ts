import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateCollectionInput,
  UpdateCollectionInput,
  AddProductsToCollectionInput,
  ToggleHomeActiveInput,
} from './collection.validate';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { CollectionService } from './collection.service';
import { CollectionRepository } from './collection.repository';

export const collectionController = (fastify: FastifyInstance) => {
  const repo = new CollectionRepository(fastify.db);
  const service = new CollectionService(repo);

  return {
    createCollectionHandler: async (
      req: FastifyRequest<{ Body: CreateCollectionInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.createCollection(req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Create collection success',
        result
      );
    },

    getAllCollectionsHandler: async (
      req: FastifyRequest<{ Querystring?: { page?: number; limit?: number } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getAllCollections(
        Number(req.query?.page) || 1,
        Number(req.query?.limit) || 10
      );
      return sendResponseSuccess(
        200,
        reply,
        'Get all collections success',
        result
      );
    },

    /**
     * Lấy collections hiển thị trên trang chủ – Public
     */
    getHomeCollectionsHandler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      const result = await service.getHomeCollections();
      return sendResponseSuccess(
        200,
        reply,
        'Get home collections success',
        result
      );
    },

    getCollectionByIdHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const result = await service.getCollectionById(req.params.id);
      return sendResponseSuccess(200, reply, 'Get collection success', result);
    },

    updateCollectionHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: UpdateCollectionInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.updateCollection(req.params.id, req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Update collection success',
        result
      );
    },

    /**
     * Bật/tắt hiển thị collection trên trang chủ – Admin
     */
    toggleHomeActiveHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: ToggleHomeActiveInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.toggleHomeActive(req.params.id, req.body);
      return sendResponseSuccess(
        200,
        reply,
        `Collection homepage visibility set to ${req.body.isHomeActive}`,
        result
      );
    },

    deleteCollectionHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      await service.deleteCollection(req.params.id);
      return sendResponseSuccess(200, reply, 'Delete collection success', null);
    },

    addProductsHandler: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: AddProductsToCollectionInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.addProducts(req.params.id, req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Add products to collection success',
        result
      );
    },
  };
};
