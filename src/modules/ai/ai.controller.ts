import { FastifyReply, FastifyRequest } from 'fastify';
import { AIService } from './ai.service';
import { AIChatInput } from './ai.validate';
import { sendResponseSuccess } from '@/utils/sendResponse';

export const aiController = (db: any) => {
  const service = new AIService(db);

  return {
    chatAIHandler: async (
      req: FastifyRequest<{ Body: AIChatInput }>,
      reply: FastifyReply
    ) => {
      // Lấy userId từ JWT nếu user đã đăng nhập (optional)
      let userId: string | undefined;
      try {
        await req.jwtVerify();
        userId = (req.user as any)?.id;
      } catch {
        // User chưa đăng nhập — vẫn cho chat bình thường
        userId = undefined;
      }

      const response = await service.chat({ ...req.body, userId });
      return sendResponseSuccess(200, reply, 'AI phản hồi thành công', response);
    },
  };
};
