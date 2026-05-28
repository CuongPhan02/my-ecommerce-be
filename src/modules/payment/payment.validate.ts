import { z } from 'zod';

export const createPaymentUrlSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  language: z.enum(['vn', 'en']).default('vn').optional(),
  bankCode: z.string().optional(),
});

export const vnpayQuerySchema = z.object({
  vnp_Amount: z.string(),
  vnp_BankCode: z.string().optional(),
  vnp_BankTranNo: z.string().optional(),
  vnp_CardType: z.string().optional(),
  vnp_OrderInfo: z.string().optional(),
  vnp_PayDate: z.string().optional(),
  vnp_ResponseCode: z.string(),
  vnp_TmnCode: z.string(),
  vnp_TransactionNo: z.string(),
  vnp_TransactionStatus: z.string(),
  vnp_TxnRef: z.string(),
  vnp_SecureHash: z.string(),
}).passthrough();

export type CreatePaymentUrlInput = z.infer<typeof createPaymentUrlSchema>;
export type VnpayQueryInput = z.infer<typeof vnpayQuerySchema>;
