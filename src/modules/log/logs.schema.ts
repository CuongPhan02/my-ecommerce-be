import { z } from 'zod';

export const viewLogSchema = z.object({
  filename: z.string().min(1, { message: 'Tên file là bắt buộc' }),
});

export const searchLogSchema = z.object({
  filename: z.string().min(1, { message: 'Tên file là bắt buộc' }),
  keyword: z.string().min(1, { message: 'Từ khóa là bắt buộc' }),
});

export type GetLogFileParams = z.infer<typeof viewLogSchema>;
export type SearchLogFileParams = z.infer<typeof searchLogSchema>;
