import { authRoutes } from '@/modules/auth/auth.route';
import logRoute from '@/modules/log/log.route';
import mediaRoutes from '@/modules/media/media.route';
import { productRoutes } from '@/modules/product/product.route';
import { collectionRoutes } from '@/modules/collection/collection.route';
import { FastifyInstance } from 'fastify';
import { settingRoutes } from '@/modules/setting/setting.route';
import { navigationRoutes } from '@/modules/navigation/navigation.route';
import { orderRoutes } from '@/modules/order/order.route';
import { cartRoutes } from '@/modules/cart/cart.route';
import { refundRoutes } from '@/modules/refund/refund.route';
import { userRoutes } from '@/modules/user/user.route';
import { inventoryRoutes } from '@/modules/inventory/inventory.route';
import { reviewRoutes } from '@/modules/review/review.route';

const registerRoutes = (server: FastifyInstance) => {
  server.register(authRoutes, { prefix: '/api/auth' });
  server.register(mediaRoutes, { prefix: '/api/media' });
  server.register(productRoutes, { prefix: '/api/products' });
  server.register(logRoute, { prefix: '/api/logs' });
  server.register(collectionRoutes, { prefix: '/api/collections' });
  server.register(navigationRoutes, { prefix: '/api/navigate' });
  server.register(settingRoutes, { prefix: '/api/settings' });
  server.register(orderRoutes, { prefix: '/api/orders' });
  server.register(cartRoutes, { prefix: '/api/cart' });
  server.register(refundRoutes, { prefix: '/api/refunds' });
  server.register(userRoutes, { prefix: '/api/users' });
  server.register(inventoryRoutes, { prefix: '/api/inventory' });
  server.register(reviewRoutes, { prefix: '/api/reviews' });
};

export default registerRoutes;
