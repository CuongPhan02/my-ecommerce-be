import { FastifyInstance } from 'fastify';
import { dashboardController } from './dashboard.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { routeWithZod } from '@/utils/routeWithZod';

export async function dashboardRoutes(fastify: FastifyInstance) {
  const controller = dashboardController(fastify);

  routeWithZod(fastify, {
    method: 'get',
    url: '/',
    disableValidator: true,
    preHandler: [authenticate, authorize(['ADMIN', 'SUPER_ADMIN'])],
    swaggerSchema: {
      tags: ['Dashboard'],
      summary: 'Lấy dữ liệu thống kê Dashboard',
      description: 'Trả về các số liệu thống kê, biểu đồ doanh thu và các đơn hàng gần đây cho Admin.',
    },
    handler: controller.getDashboardDataHandler,
  });
}
