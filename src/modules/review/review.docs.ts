export const REVIEW_TAG = 'Reviews';

export const REVIEW_DOCUMENTATION = {
  REVIEW_SUMMARIES: {
    SUBMIT_REVIEW: 'Submit a product review (Customer)',
    GET_PRODUCT_REVIEWS: 'Get list of approved product reviews (Public)',
    GET_ADMIN_REVIEWS: 'Get list of reviews with moderate tools (Admin)',
    GET_REVIEW_DETAIL: 'Get detail of a review (Admin)',
    MODERATE_STATUS: 'Update review approval status (Admin)',
    ADMIN_REPLY: 'Reply to a user review (Admin)',
    DELETE_REVIEW: 'Delete a review permanently (Admin)',
  },
  REVIEW_DESCRIPTIONS: {
    SUBMIT_REVIEW: 'Người dùng gửi bình luận đánh giá cho sản phẩm và biến thể đã mua.',
    GET_PRODUCT_REVIEWS: 'Lấy danh sách bình luận đã duyệt hiển thị công khai trên trang chi tiết sản phẩm.',
    GET_ADMIN_REVIEWS: 'Lấy danh sách tất cả bình luận đánh giá trong hệ thống dành cho Admin điều hành.',
    GET_REVIEW_DETAIL: 'Lấy thông tin chi tiết một bình luận đánh giá cụ thể trong hệ thống.',
    MODERATE_STATUS: 'Cập nhật trạng thái duyệt: Đã Duyệt (APPROVED), Chờ Duyệt (PENDING), hoặc Đã Ẩn (HIDDEN).',
    ADMIN_REPLY: 'Nhập nội dung trả lời chính thức từ shop đến bình luận của khách hàng.',
    DELETE_REVIEW: 'Xóa vĩnh viễn đánh giá ra khỏi hệ thống cơ sở dữ liệu.',
  },
  REVIEW_REQUEST_BODIES: {
    SUBMIT_REVIEW: {
      type: 'object',
      required: ['productId', 'rating', 'content'],
      properties: {
        productId: { type: 'string', description: 'ID của sản phẩm' },
        productVariantId: { type: 'string', description: 'ID biến thể sản phẩm cụ thể (nếu có)' },
        rating: { type: 'integer', description: 'Số điểm đánh giá (1-5 sao)' },
        content: { type: 'string', description: 'Nội dung bình luận' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Các nhãn đính kèm (Ví dụ: Sản phẩm đẹp, Giá tốt)' },
      },
    },
    MODERATE_STATUS: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: ['PENDING', 'APPROVED', 'HIDDEN'], description: 'Trạng thái duyệt mới' },
      },
    },
    ADMIN_REPLY: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: 'string', description: 'Nội dung phản hồi từ quản trị viên' },
      },
    },
  },
};
