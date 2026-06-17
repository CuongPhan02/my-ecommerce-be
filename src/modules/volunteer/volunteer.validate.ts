import { z } from 'zod';

export const createVolunteerSchema = z.object({
  fullName: z.string().min(1, 'Họ và tên không được để trống'),
  phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
  email: z.string().email('Địa chỉ email không hợp lệ'),
  message: z.string().optional().nullable(),
});

export const volunteerQuerySchema = z.object({
  page: z.preprocess((val) => Number(val || 1), z.number().int().min(1)).optional().default(1),
  limit: z.preprocess((val) => Number(val || 10), z.number().int().min(1)).optional().default(10),
  search: z.string().optional(),
});

export const sendEmailSchema = z.object({
  volunteerIds: z.array(z.string()).optional(),
  subject: z.string().min(1, 'Tiêu đề không được để trống'),
  title: z.string().min(1, 'Tựa đề không được để trống'),
  message: z.string().min(1, 'Nội dung không được để trống'),
});

export type CreateVolunteerType = z.infer<typeof createVolunteerSchema>;
export type VolunteerQueryType = z.infer<typeof volunteerQuerySchema>;
export type SendEmailType = z.infer<typeof sendEmailSchema>;
