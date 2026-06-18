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
  imageBase64: z.string().optional(),
  mimeType: z
    .enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    .optional(),
  userId: z.string().uuid().optional(),
});

export type AIChatInput = z.infer<typeof aiChatSchema>;
