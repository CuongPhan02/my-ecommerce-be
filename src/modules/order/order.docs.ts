export const ORDER_TAG = 'Order';

export const ORDER_PAGINATION_QUERYSTRING = {
  type: 'object',
  properties: {
    page: { type: 'number', default: 1, description: 'Trang hiện tại' },
    limit: { type: 'number', default: 10, description: 'Số bản ghi mỗi trang' },
    search: {
      type: 'string',
      nullable: true,
      description: 'Tìm theo mã đơn, tên khách hàng hoặc email',
    },
    status: {
      type: 'string',
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
      nullable: true,
      description: 'Lọc theo trạng thái giao hàng',
    },
    paymentStatus: {
      type: 'string',
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      nullable: true,
      description: 'Lọc theo trạng thái thanh toán',
    },
    sort: {
      type: 'string',
      enum: ['newest', 'oldest', 'amount_asc', 'amount_desc'],
      default: 'newest',
      nullable: true,
      description: 'Sắp xếp kết quả',
    },
  },
};

export const ORDER_DOCUMENTATION = {
  ORDER_SUMMARIES: {
    GET_ALL_ORDERS: 'Get all orders (Admin)',
    GET_ORDER_BY_ID: 'Get order detail by ID (Admin)',
    UPDATE_ORDER: 'Update order status and payment status (Admin)',
    GET_MY_ORDERS: 'Get current user orders',
    GET_MY_ORDER_BY_ID: 'Get current user order detail',
  },
  ORDER_DESCRIPTIONS: {
    GET_ALL_ORDERS:
      'Lấy danh sách toàn bộ đơn hàng với bộ lọc: trạng thái giao hàng, trạng thái thanh toán, tìm kiếm và phân trang',
    GET_ORDER_BY_ID:
      'Lấy chi tiết đơn hàng bao gồm thông tin khách hàng, địa chỉ, sản phẩm và thanh toán',
    UPDATE_ORDER:
      'Cập nhật trạng thái đơn hàng (PENDING → PROCESSING → SHIPPED → DELIVERED) và trạng thái thanh toán',
    GET_MY_ORDERS: 'Lấy danh sách đơn hàng của người dùng hiện tại',
    GET_MY_ORDER_BY_ID: 'Lấy chi tiết một đơn hàng của người dùng hiện tại',
  },
  ORDER_REQUEST_BODIES: {
    UPDATE_ORDER: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'],
          description: 'Trạng thái giao hàng mới',
        },
        paymentStatus: {
          type: 'string',
          enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
          description: 'Trạng thái thanh toán mới',
        },
      },
    },
  },
};
