export const PAYMENT_TAG = 'Payment';

export const PAYMENT_DOCUMENTATION = {
  PAYMENT_SUMMARIES: {
    CREATE_PAYMENT_URL: 'Create VNPAY payment URL for an order',
    VNPAY_RETURN: 'VNPAY return callback handler',
    VNPAY_IPN: 'VNPAY Instant Payment Notification (IPN) handler',
  },
  PAYMENT_DESCRIPTIONS: {
    CREATE_PAYMENT_URL: 'Generates a secure checkout URL from VNPAY sandbox for the specified order.',
    VNPAY_RETURN: 'Handles standard browser redirect from VNPAY after payment execution.',
    VNPAY_IPN: 'Asynchronous server-to-server webhook from VNPAY to securely update payment and order statuses.',
  },
  PAYMENT_REQUEST_BODIES: {
    CREATE_PAYMENT_URL: {
      type: 'object',
      required: ['orderId'],
      properties: {
        orderId: { type: 'string', example: 'order_123456789' },
        language: { type: 'string', enum: ['vn', 'en'], default: 'vn', example: 'vn' },
        bankCode: { type: 'string', example: 'NCB' },
      },
    },
  },
};
