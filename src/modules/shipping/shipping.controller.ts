import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateShippingInput,
  UpdateShippingInput,
} from './shipping.validate';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { ShippingService } from './shipping.service';
import { ShippingRepository } from './shipping.repository';

export const shippingController = (fastify: FastifyInstance) => {
  const repo = new ShippingRepository(fastify.db);
  const service = new ShippingService(repo);

  return {
    getAllMethodsHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await service.getAllMethods();
      return sendResponseSuccess(
        200,
        reply,
        'Get all shipping methods success',
        result
      );
    },

    getActiveMethodsHandler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      const result = await service.getActiveMethods();
      return sendResponseSuccess(
        200,
        reply,
        'Get active shipping methods success',
        result
      );
    },

    createMethodHandler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      const body = req.body as CreateShippingInput;
      const result = await service.createMethod(body);
      return sendResponseSuccess(
        200,
        reply,
        'Create shipping method success',
        result
      );
    },

    updateMethodHandler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      const params = req.params as { id: string };
      const body = req.body as UpdateShippingInput;
      const result = await service.updateMethod(params.id, body);
      return sendResponseSuccess(
        200,
        reply,
        'Update shipping method success',
        result
      );
    },

    deleteMethodHandler: async (
      req: FastifyRequest,
      reply: FastifyReply
    ) => {
      const params = req.params as { id: string };
      await service.deleteMethod(params.id);
      return sendResponseSuccess(200, reply, 'Delete shipping method success', null);
    },
  };
};
