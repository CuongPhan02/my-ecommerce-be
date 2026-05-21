import { z } from 'zod';
import { refundStatusEnum } from '@/db/_helpers';

const statusValues = refundStatusEnum.enumValues;

export const refundQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.enum(statusValues).optional(),
  sort: z.enum(['desc', 'asc']).optional().default('desc'),
});

export type RefundQueryType = z.infer<typeof refundQuerySchema>;

export const createRefundSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  amount: z.number().positive('Amount must be greater than 0'),
});

export type CreateRefundType = z.infer<typeof createRefundSchema>;

export const approveRefundSchema = z.object({
  refundMethod: z.string().min(1, 'Refund method is required'),
  internalNote: z.string().optional(),
});

export type ApproveRefundType = z.infer<typeof approveRefundSchema>;

export const rejectRefundSchema = z.object({
  rejectReason: z.string().min(1, 'Reject reason is required'),
});

export type RejectRefundType = z.infer<typeof rejectRefundSchema>;

export const refundParamSchema = z.object({
  id: z.string().min(1, 'Refund request ID is required'),
});
