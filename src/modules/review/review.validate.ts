import { z } from 'zod';

export const reviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'HIDDEN']).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  productId: z.string().optional(),
  sort: z.enum(['desc', 'asc']).optional().default('desc'),
});

export type ReviewQueryType = z.infer<typeof reviewQuerySchema>;

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Mã sản phẩm không được bỏ trống'),
  productVariantId: z.string().optional(),
  rating: z.number().int().min(1, 'Đánh giá tối thiểu 1 sao').max(5, 'Đánh giá tối đa 5 sao'),
  content: z.string().min(3, 'Nội dung bình luận phải có ít nhất 3 ký tự'),
  tags: z.array(z.string()).optional(),
});

export type CreateReviewType = z.infer<typeof createReviewSchema>;
export type CreateReviewBodyType = CreateReviewType;

export const moderateReviewSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'HIDDEN']),
});

export type ModerateReviewBodyType = z.infer<typeof moderateReviewSchema>;

export const adminReplySchema = z.object({
  content: z.string().min(1, 'Nội dung phản hồi không được bỏ trống'),
});

export type AdminReplyType = z.infer<typeof adminReplySchema>;
export type AdminReplyBodyType = AdminReplyType;

export const reviewParamSchema = z.object({
  id: z.string().min(1, 'Mã đánh giá không được bỏ trống'),
});

export type ReviewParamType = z.infer<typeof reviewParamSchema>;

export const reviewProductParamSchema = z.object({
  productId: z.string().min(1, 'Mã sản phẩm không được bỏ trống'),
});

export type ReviewProductParamType = z.infer<typeof reviewProductParamSchema>;
