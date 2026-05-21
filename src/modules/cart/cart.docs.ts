export const CART_TAG = 'Cart';

export const CART_DOCUMENTATION = {
  CART_SUMMARIES: {
    GET_CART: 'Get active cart and its items',
    ADD_TO_CART: 'Add a product variant to the cart',
    UPDATE_ITEM: 'Update quantity of an item in the cart',
    REMOVE_ITEM: 'Remove an item from the cart',
    CLEAR_CART: 'Clear all items in the cart',
  },
  CART_DESCRIPTIONS: {
    GET_CART: 'Lấy giỏ hàng hiện tại của khách hàng cùng danh sách sản phẩm. Nếu chưa có giỏ hàng, hệ thống sẽ tự động khởi tạo.',
    ADD_TO_CART: 'Thêm sản phẩm (biến thể) vào giỏ hàng. Nếu sản phẩm đã tồn tại, số lượng sẽ được cộng thêm.',
    UPDATE_ITEM: 'Cập nhật số lượng của một sản phẩm cụ thể trong giỏ hàng.',
    REMOVE_ITEM: 'Xóa một sản phẩm cụ thể khỏi giỏ hàng.',
    CLEAR_CART: 'Xóa toàn bộ sản phẩm khỏi giỏ hàng.',
  },
  CART_REQUEST_BODIES: {
    ADD_TO_CART: {
      type: 'object',
      required: ['productVariantId', 'quantity'],
      properties: {
        productVariantId: { type: 'string', description: 'ID của biến thể sản phẩm' },
        quantity: { type: 'number', minimum: 1, default: 1, description: 'Số lượng sản phẩm' },
      },
    },
    UPDATE_ITEM: {
      type: 'object',
      required: ['quantity'],
      properties: {
        quantity: { type: 'number', minimum: 1, description: 'Số lượng mới của sản phẩm' },
      },
    },
  },
};
