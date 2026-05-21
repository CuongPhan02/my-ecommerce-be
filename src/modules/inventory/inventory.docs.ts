export const INVENTORY_TAG = 'Inventory';

export const INVENTORY_DOCUMENTATION = {
  INVENTORY_SUMMARIES: {
    GET_STOCK_LIST: 'Get list of product variant stock (Admin)',
    IMPORT_STOCK: 'Create stock import voucher (Admin)',
    ADJUST_STOCK: 'Directly balance/adjust stock of a variant (Admin)',
    GET_TRANSACTIONS: 'Get inventory transaction logs/history (Admin)',
  },
  INVENTORY_DESCRIPTIONS: {
    GET_STOCK_LIST: 'Lấy danh sách tồn kho sản phẩm biến thể (hỗ trợ lọc danh mục, tìm kiếm SKU/Tên, trạng thái Còn/Hết hàng).',
    IMPORT_STOCK: 'Lập phiếu nhập hàng mới. Tăng số lượng sản phẩm trong kho và cập nhật giá vốn (giá mua).',
    ADJUST_STOCK: 'Cân đối kho hàng thủ công. Điều chỉnh trực tiếp số lượng tồn thực tế của biến thể kèm lý do điều chỉnh.',
    GET_TRANSACTIONS: 'Lấy danh sách lịch sử giao dịch kho (nhập hàng, cân đối kho, xuất hàng).',
  },
  INVENTORY_REQUEST_BODIES: {
    IMPORT_STOCK: {
      type: 'object',
      required: ['productVariantId', 'quantity', 'purchasePrice', 'supplier'],
      properties: {
        productVariantId: { type: 'string', description: 'ID của sản phẩm biến thể' },
        quantity: { type: 'integer', description: 'Số lượng nhập kho (phải > 0)' },
        purchasePrice: { type: 'number', description: 'Giá mua đơn vị (phải > 0)' },
        supplier: { type: 'string', description: 'Tên nhà cung cấp / xưởng may' },
      },
    },
    ADJUST_STOCK: {
      type: 'object',
      required: ['productVariantId', 'quantity', 'reason'],
      properties: {
        productVariantId: { type: 'string', description: 'ID của sản phẩm biến thể' },
        quantity: { type: 'integer', description: 'Số lượng tồn kho thực tế điều chỉnh tới (phải >= 0)' },
        reason: { type: 'string', description: 'Lý do điều chỉnh (phải từ 5 ký tự trở lên)' },
      },
    },
  },
};
