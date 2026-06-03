import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { sendResponseSuccess } from '@/utils/sendResponse';

export const dashboardController = (fastify: FastifyInstance) => {
  const repo = new DashboardRepository(fastify.db);
  const service = new DashboardService(repo);

  return {
    getDashboardDataHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const result = await service.getDashboardData();
      return sendResponseSuccess(200, reply, 'Lấy dữ liệu dashboard thành công', result);
    },
  };
};
