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
    CREATE_ORDER: 'Create a new order (Checkout)',
    TRACK_ORDER: 'Track order details publicly (No Auth)',
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
    CREATE_ORDER: 'Đặt hàng mới từ giỏ hàng hiện tại của người dùng, tự động trừ tồn kho và xóa giỏ hàng',
    TRACK_ORDER: 'Theo dõi trạng thái đơn hàng công khai thông qua mã Order CUID của đơn hàng (Không yêu cầu đăng nhập)',
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
    CREATE_ORDER: {
      type: 'object',
      properties: {
        shippingAddressId: {
          type: 'string',
          example: 'cuid_dia_chi_nhan_hang',
          description: 'ID địa chỉ nhận hàng đã lưu (nếu có)',
        },
        couponCode: {
          type: 'string',
          example: 'SALE10',
          description: 'Mã giảm giá áp dụng (nếu có)',
        },
        shippingName: {
          type: 'string',
          example: 'Nguyễn Văn A',
          description: 'Họ tên người nhận (Bắt buộc nếu không có shippingAddressId)',
        },
        shippingPhone: {
          type: 'string',
          example: '0987654321',
          description: 'Số điện thoại người nhận (Bắt buộc nếu không có shippingAddressId)',
        },
        shippingEmail: {
          type: 'string',
          example: 'customer@gmail.com',
          description: 'Email người nhận (Tùy chọn)',
        },
        street: {
          type: 'string',
          example: 'Số 123 Đường Láng',
          description: 'Địa chỉ cụ thể - số nhà, tên đường (Bắt buộc nếu không có shippingAddressId)',
        },
        province: {
          type: 'string',
          example: 'Hà Nội',
          description: 'Tỉnh / Thành phố (Bắt buộc nếu không có shippingAddressId)',
        },
        city: {
          type: 'string',
          example: 'Đống Đa',
          description: 'Quận / Huyện (Bắt buộc nếu không có shippingAddressId)',
        },
        note: {
          type: 'string',
          example: 'Giao giờ hành chính, gọi điện trước khi giao',
          description: 'Ghi chú thêm cho người vận chuyển (Tùy chọn)',
        },
      },
    },
  },
};
