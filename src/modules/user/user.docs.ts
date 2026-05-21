export const USER_TAG = 'User Management';

export const USER_DOCUMENTATION = {
  USER_SUMMARIES: {
    GET_ALL_USERS: 'Get list of users (Admin)',
    GET_USER_DETAIL: 'Get detail of a user (Admin)',
    CREATE_USER: 'Create a new user (Admin)',
    UPDATE_USER: 'Update a user (Admin)',
    DELETE_USER: 'Delete a user (Admin)',
    BULK_DELETE_USERS: 'Bulk delete users (Admin)',
  },
  USER_DESCRIPTIONS: {
    GET_ALL_USERS: 'Lấy danh sách người dùng với phân trang, tìm kiếm và bộ lọc.',
    GET_USER_DETAIL: 'Lấy chi tiết thông tin người dùng theo ID.',
    CREATE_USER: 'Tạo tài khoản người dùng mới từ trang quản trị.',
    UPDATE_USER: 'Cập nhật thông tin tài khoản người dùng.',
    DELETE_USER: 'Xóa tài khoản người dùng.',
    BULK_DELETE_USERS: 'Xóa hàng loạt tài khoản người dùng bằng cách truyền mảng các IDs.',
  },
  USER_REQUEST_BODIES: {
    CREATE_USER: {
      type: 'object',
      required: ['name', 'email'],
      properties: {
        name: { type: 'string', description: 'Họ và tên' },
        email: { type: 'string', description: 'Địa chỉ Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        role: { type: 'string', description: 'Vai trò (CUSTOMER, ADMIN, SUPER_ADMIN, STAFF, SALES, EDITOR, INVENTORY)' },
        isActive: { type: 'boolean', description: 'Trạng thái hoạt động' },
        password: { type: 'string', description: 'Mật khẩu (mặc định: Admin@12345)' },
      },
    },
    UPDATE_USER: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Họ và tên' },
        email: { type: 'string', description: 'Địa chỉ Email' },
        phone: { type: 'string', description: 'Số điện thoại' },
        role: { type: 'string', description: 'Vai trò (CUSTOMER, ADMIN, SUPER_ADMIN, STAFF, SALES, EDITOR, INVENTORY)' },
        isActive: { type: 'boolean', description: 'Trạng thái hoạt động' },
      },
    },
    BULK_DELETE: {
      type: 'object',
      required: ['ids'],
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Danh sách IDs người dùng cần xóa',
        },
      },
    },
  },
};
