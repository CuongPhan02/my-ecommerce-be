import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AddressService } from './address.service';
import { AddressRepository } from './address.repository';
import { CreateAddressType, UpdateAddressType } from './address.validation';
import { sendResponseSuccess } from '@/utils/sendResponse';

export const addressController = (fastify: FastifyInstance) => {
  const repo = new AddressRepository(fastify.db);
  const service = new AddressService(repo);

  return {
    getMyAddressesHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = (req as any).user.id;
      const result = await service.getMyAddresses(userId);
      return sendResponseSuccess(200, reply, 'Lấy danh sách địa chỉ thành công', result);
    },

    createAddressHandler: async (
      req: FastifyRequest<{ Body: CreateAddressType }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user.id;
      const result = await service.createAddress(userId, req.body);
      return sendResponseSuccess(201, reply, 'Thêm địa chỉ mới thành công', result);
    },

    updateAddressHandler: async (
      req: FastifyRequest<{ Params: { id: string }; Body: UpdateAddressType }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user.id;
      const result = await service.updateAddress(req.params.id, userId, req.body);
      return sendResponseSuccess(200, reply, 'Cập nhật địa chỉ thành công', result);
    },

    deleteAddressHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user.id;
      await service.deleteAddress(req.params.id, userId);
      return sendResponseSuccess(200, reply, 'Xóa địa chỉ thành công');
    },

    setDefaultAddressHandler: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user.id;
      const result = await service.setDefaultAddress(req.params.id, userId);
      return sendResponseSuccess(200, reply, 'Đặt địa chỉ mặc định thành công', result);
    },
  };
};
