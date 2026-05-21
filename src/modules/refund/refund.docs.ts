export const REFUND_TAG = 'Refund';

export const REFUND_DOCUMENTATION = {
  REFUND_SUMMARIES: {
    GET_ALL_REFUNDS: 'Get list of refund requests (Admin)',
    GET_REFUND_DETAIL: 'Get detail of a refund request',
    APPROVE_REFUND: 'Approve a refund request',
    REJECT_REFUND: 'Reject a refund request',
    CREATE_REFUND: 'Create a new refund request (Customer)',
  },
  REFUND_DESCRIPTIONS: {
    GET_ALL_REFUNDS: 'Lấy danh sách yêu cầu hoàn tiền (có phân trang, lọc theo trạng thái, tìm kiếm).',
    GET_REFUND_DETAIL: 'Lấy thông tin chi tiết một yêu cầu hoàn tiền.',
    APPROVE_REFUND: 'Duyệt yêu cầu hoàn tiền. Cần chỉ định phương thức hoàn tiền và ghi chú nội bộ.',
    REJECT_REFUND: 'Từ chối yêu cầu hoàn tiền. Cần cung cấp lý do từ chối để gửi cho khách hàng.',
    CREATE_REFUND: 'Tạo một yêu cầu hoàn tiền mới cho một đơn hàng cụ thể.',
  },
  REFUND_REQUEST_BODIES: {
    APPROVE_REFUND: {
      type: 'object',
      required: ['refundMethod'],
      properties: {
        refundMethod: { type: 'string', description: 'Phương thức hoàn tiền (VD: Ví Aura)' },
        internalNote: { type: 'string', description: 'Ghi chú nội bộ' },
      },
    },
    REJECT_REFUND: {
      type: 'object',
      required: ['rejectReason'],
      properties: {
        rejectReason: { type: 'string', description: 'Lý do từ chối' },
      },
    },
    CREATE_REFUND: {
      type: 'object',
      required: ['orderId', 'reason', 'amount'],
      properties: {
        orderId: { type: 'string', description: 'ID của đơn hàng' },
        reason: { type: 'string', description: 'Lý do hoàn trả' },
        amount: { type: 'number', description: 'Số tiền yêu cầu hoàn' },
      },
    },
  },
};
