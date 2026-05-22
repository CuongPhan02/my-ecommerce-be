import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VoucherRepository } from './voucher.repository';
import { VoucherService } from './voucher.service';
import {
  CreateVoucherInput,
  UpdateVoucherInput,
  DeleteVoucherInput,
  GetVoucherInput,
  GetVouchersQueryInput,
  ToggleVoucherStatusInput,
} from './voucher.validate';
import { sendResponseSuccess } from '@/utils/sendResponse';

export const voucherController = (fastify: FastifyInstance) => {
  const repo = new VoucherRepository(fastify.db);
  const service = new VoucherService(repo);

  return {
    createVoucherHandler: async (
      req: FastifyRequest<{ Body: CreateVoucherInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.createVoucher(req.body);
      return sendResponseSuccess(
        201,
        reply,
        'Voucher created successfully',
        result
      );
    },

    getVouchersHandler: async (
      req: FastifyRequest<{ Querystring: GetVouchersQueryInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.getVouchers(req.query);
      return sendResponseSuccess(
        200,
        reply,
        'Vouchers retrieved successfully',
        result
      );
    },

    getVoucherByIdHandler: async (
      req: FastifyRequest<{ Params: GetVoucherInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.getVoucherById(req.params.id);
      return sendResponseSuccess(
        200,
        reply,
        'Voucher retrieved successfully',
        result
      );
    },

    updateVoucherHandler: async (
      req: FastifyRequest<{ Params: GetVoucherInput; Body: UpdateVoucherInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.updateVoucher(req.params.id, req.body);
      return sendResponseSuccess(
        200,
        reply,
        'Voucher updated successfully',
        result
      );
    },

    deleteVoucherHandler: async (
      req: FastifyRequest<{ Params: DeleteVoucherInput }>,
      reply: FastifyReply
    ) => {
      const result = await service.deleteVoucher(req.params.id);
      return sendResponseSuccess(
        200,
        reply,
        'Voucher deleted successfully',
        result
      );
    },

    toggleVoucherStatusHandler: async (
      req: FastifyRequest<{
        Params: GetVoucherInput;
        Body: ToggleVoucherStatusInput;
      }>,
      reply: FastifyReply
    ) => {
      const result = await service.toggleVoucherStatus(
        req.params.id,
        req.body.isActive
      );
      return sendResponseSuccess(
        200,
        reply,
        'Voucher status updated successfully',
        result
      );
    },
  };
};
