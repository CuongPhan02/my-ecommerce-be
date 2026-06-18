import { z } from 'zod';

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message không được để trống'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        message: z.string().min(1),
      })
    )
    .optional(),
});

export type AIChatInput = z.infer<typeof aiChatSchema>;
