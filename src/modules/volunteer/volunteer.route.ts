import { FastifyInstance } from 'fastify';
import { volunteerController } from './volunteer.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { routeWithZod } from '@/utils/routeWithZod';
import {
  createVolunteerSchema,
  volunteerQuerySchema,
  sendEmailSchema,
} from './volunteer.validate';
import { ROLE_NAME } from '@/constants';

export async function volunteerRoutes(fastify: FastifyInstance) {
  const controller = volunteerController(fastify);

  // POST /api/volunteers - Register a volunteer (Public)
  routeWithZod(fastify, {
    method: 'post',
    url: '/',
    disableValidator: true,
    swaggerSchema: {
      tags: ['Volunteers'],
      summary: 'Đăng ký làm tình nguyện viên',
      description: 'Lưu thông tin đăng ký của tình nguyện viên và tự động gửi email chào mừng.',
    },
    bodySchema: createVolunteerSchema,
    handler: controller.registerVolunteerHandler,
  });

  // GET /api/volunteers - Get list of volunteers (Admin/Staff/Sales)
  routeWithZod(fastify, {
    method: 'get',
    url: '/',
    disableValidator: true,
    swaggerSchema: {
      tags: ['Volunteers'],
      summary: 'Lấy danh sách tình nguyện viên',
      description: 'Lấy danh sách tình nguyện viên có hỗ trợ tìm kiếm và phân trang.',
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.SUPER_ADMIN, ROLE_NAME.ADMIN, ROLE_NAME.STAFF, ROLE_NAME.SALES],
    querySchema: volunteerQuerySchema,
    handler: controller.getVolunteersHandler,
  });

  // DELETE /api/volunteers/:id - Delete a volunteer registration (Admin/Super Admin only)
  routeWithZod(fastify, {
    method: 'delete',
    url: '/:id',
    disableValidator: true,
    swaggerSchema: {
      tags: ['Volunteers'],
      summary: 'Xóa thông tin tình nguyện viên',
      description: 'Xóa đăng ký tình nguyện viên theo ID.',
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.SUPER_ADMIN, ROLE_NAME.ADMIN],
    handler: controller.deleteVolunteerHandler,
  });

  // POST /api/volunteers/send-email - Send announcement/notification emails (Admin/Super Admin/Staff)
  routeWithZod(fastify, {
    method: 'post',
    url: '/send-email',
    disableValidator: true,
    swaggerSchema: {
      tags: ['Volunteers'],
      summary: 'Gửi email cho các tình nguyện viên',
      description: 'Gửi email cho danh sách các ID được chọn (hoặc tất cả nếu để rỗng).',
    },
    preHandler: [authenticate],
    roles: [ROLE_NAME.SUPER_ADMIN, ROLE_NAME.ADMIN, ROLE_NAME.STAFF],
    bodySchema: sendEmailSchema,
    handler: controller.sendCustomEmailHandler,
  });
}
