import { FastifyInstance } from 'fastify';
import { aiController } from './ai.controller';
import { routeWithZod } from '@/utils/routeWithZod';
import { aiChatSchema } from './ai.validate';

export async function aiRoutes(fastify: FastifyInstance) {
  const controller = aiController(fastify.db);

  // POST /api/ai/chat - Trò chuyện với AI (Public, optional auth)
  routeWithZod(fastify, {
    method: 'post',
    url: '/chat',
    disableValidator: true,
    swaggerSchema: {
      tags: ['AI Chatbot'],
      summary: 'Trò chuyện với trợ lý ảo AI của Nude Shop',
      description:
        'Gửi tin nhắn, ảnh và lịch sử trò chuyện để nhận phản hồi từ Gemini AI với Function Calling. Nếu đã đăng nhập có thể tra cứu đơn hàng.',
    },
    bodySchema: aiChatSchema,
    handler: controller.chatAIHandler,
  });
}
