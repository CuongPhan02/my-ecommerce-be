import { FastifyInstance } from 'fastify';
import { aiController } from './ai.controller';
import { routeWithZod } from '@/utils/routeWithZod';
import { aiChatSchema } from './ai.validate';

export async function aiRoutes(fastify: FastifyInstance) {
  const controller = aiController();

  // POST /api/ai/chat - Trò chuyện với AI (Public)
  routeWithZod(fastify, {
    method: 'post',
    url: '/chat',
    disableValidator: true,
    swaggerSchema: {
      tags: ['AI Chatbot'],
      summary: 'Trò chuyện với trợ lý ảo AI của Nude Shop',
      description: 'Gửi tin nhắn và lịch sử trò chuyện để nhận phản hồi từ Gemini AI.',
    },
    bodySchema: aiChatSchema,
    handler: controller.chatAIHandler,
  });
}
