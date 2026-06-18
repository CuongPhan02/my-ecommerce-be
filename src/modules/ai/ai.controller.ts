import { FastifyReply, FastifyRequest } from 'fastify';
import { AIService } from './ai.service';
import { AIChatInput } from './ai.validate';
import { sendResponseSuccess } from '@/utils/sendResponse';

export const aiController = () => {
  const service = new AIService();

  return {
    chatAIHandler: async (
      req: FastifyRequest<{ Body: AIChatInput }>,
      reply: FastifyReply
    ) => {
      const response = await service.chat(req.body);
      return sendResponseSuccess(200, reply, 'AI phản hồi thành công', {
        reply: response,
      });
    },
  };
};
