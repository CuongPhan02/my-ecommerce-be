import { ForbiddenError, UnauthorizedError } from '@/utils/errors';
import { FastifyReply, FastifyRequest } from 'fastify';

export const authenticate = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Yêu cầu xác thực. Thiếu token.');
    }

    // Verify token using fastify-jwt
    await req.jwtVerify();

    // Optional: Check if user still exists in DB if needed, but for now rely on JWT validity
  } catch (err) {
    throw new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn');
  }
};

export const authorize = (roles: string[]) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.user as { role: string };

    if (!user || !user.role) {
      throw new UnauthorizedError('Không tìm thấy vai trò người dùng');
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenError('Truy cập bị từ chối');
    }
  };
};
