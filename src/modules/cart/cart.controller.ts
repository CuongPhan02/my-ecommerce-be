import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { sendResponseSuccess } from '@/utils/sendResponse';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { AddToCartInput, UpdateCartItemInput } from './cart.validate';

export const cartController = (fastify: FastifyInstance) => {
  const repo = new CartRepository(fastify.db);
  const service = new CartService(repo);

  return {
    getCartHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = (req as any).user?.id;
      const result = await service.getCart(userId);
      return sendResponseSuccess(200, reply, 'Lấy giỏ hàng thành công', result);
    },

    addItemToCartHandler: async (
      req: FastifyRequest<{ Body: AddToCartInput }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user?.id;
      const { productVariantId, quantity } = req.body;
      const result = await service.addItemToCart(userId, productVariantId, quantity);
      return sendResponseSuccess(200, reply, 'Thêm vào giỏ hàng thành công', result);
    },

    updateItemQuantityHandler: async (
      req: FastifyRequest<{ Params: { itemId: string }; Body: UpdateCartItemInput }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user?.id;
      const { itemId } = req.params;
      const { quantity } = req.body;
      const result = await service.updateItemQuantity(userId, itemId, quantity);
      return sendResponseSuccess(200, reply, 'Cập nhật số lượng thành công', result);
    },

    removeItemFromCartHandler: async (
      req: FastifyRequest<{ Params: { itemId: string } }>,
      reply: FastifyReply
    ) => {
      const userId = (req as any).user?.id;
      const { itemId } = req.params;
      const result = await service.removeItemFromCart(userId, itemId);
      return sendResponseSuccess(200, reply, 'Xóa sản phẩm khỏi giỏ hàng thành công', result);
    },

    clearCartHandler: async (req: FastifyRequest, reply: FastifyReply) => {
      const userId = (req as any).user?.id;
      const result = await service.clearCart(userId);
      return sendResponseSuccess(200, reply, 'Làm trống giỏ hàng thành công', result);
    },
  };
};
