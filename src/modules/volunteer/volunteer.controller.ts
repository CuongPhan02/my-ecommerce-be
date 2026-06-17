import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VolunteerService } from './volunteer.service';
import { VolunteerRepository } from './volunteer.repository';
import { sendResponseSuccess } from '@/utils/sendResponse';
import {
  CreateVolunteerType,
  VolunteerQueryType,
  SendEmailType,
} from './volunteer.validate';

export const volunteerController = (fastify: FastifyInstance) => {
  const repo = new VolunteerRepository();
  const service = new VolunteerService(repo);

  return {
    registerVolunteerHandler: async (
      request: FastifyRequest<{ Body: CreateVolunteerType }>,
      reply: FastifyReply
    ) => {
      const data = request.body;
      const result = await service.registerVolunteer(data);
      return sendResponseSuccess(201, reply, 'Đăng ký tình nguyện viên thành công', result);
    },

    getVolunteersHandler: async (
      request: FastifyRequest<{ Querystring: VolunteerQueryType }>,
      reply: FastifyReply
    ) => {
      const query = request.query;
      const result = await service.getVolunteers(query);
      return sendResponseSuccess(200, reply, 'Lấy danh sách tình nguyện viên thành công', result);
    },

    deleteVolunteerHandler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const result = await service.deleteVolunteer(id);
      return sendResponseSuccess(200, reply, 'Xóa tình nguyện viên thành công', result);
    },

    sendCustomEmailHandler: async (
      request: FastifyRequest<{ Body: SendEmailType }>,
      reply: FastifyReply
    ) => {
      const data = request.body;
      const result = await service.sendCustomEmail(data);
      return sendResponseSuccess(200, reply, 'Gửi email cho tình nguyện viên thành công', result);
    },
  };
};
