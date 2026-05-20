import { IncomingMessage, ServerResponse } from 'http';
import { buildServer } from '../src/app';

// Khởi tạo server bên ngoài handler để tận dụng khả năng giữ ấm (warm start)
// Điều này giúp tái sử dụng kết nối cơ sở dữ liệu và tối ưu hóa cold start.
const server = buildServer();

export default async (req: IncomingMessage, res: ServerResponse) => {
  // Đợi Fastify đăng ký xong tất cả các plugin (database, routes, swagger...)
  await server.ready();
  
  // Chuyển tiếp request từ Vercel sang Fastify
  server.server.emit('request', req, res);
};
