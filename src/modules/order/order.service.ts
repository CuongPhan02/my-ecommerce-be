import { NotFoundError } from '@/utils/errors';
import { OrderRepository } from './order.repository';
import { GetOrdersQuery, UpdateOrderInput } from './order.validate';

export class OrderService {
  private repo: OrderRepository;

  constructor(repo: OrderRepository) {
    this.repo = repo;
  }

  // ======= ADMIN: Lấy tất cả đơn hàng =======
  async getAllOrders(filter: GetOrdersQuery) {
    const { orders, total } = await this.repo.getAllOrders(filter);
    return {
      data: orders,
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  // ======= ADMIN: Lấy chi tiết đơn hàng =======
  async getOrderById(id: string) {
    const order = await this.repo.getOrderById(id);
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }

  // ======= ADMIN: Cập nhật trạng thái đơn hàng =======
  async updateOrder(id: string, data: UpdateOrderInput) {
    // Kiểm tra đơn hàng tồn tại
    await this.getOrderById(id);
    return this.repo.updateOrder(id, data);
  }

  // ======= USER: Lấy đơn hàng của tôi =======
  async getMyOrders(userId: string, page: number, limit: number) {
    const { orders, total } = await this.repo.getOrdersByUserId(userId, page, limit);
    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ======= USER: Lấy chi tiết đơn hàng của tôi =======
  async getMyOrderById(orderId: string, userId: string) {
    const order = await this.repo.getMyOrderById(orderId, userId);
    if (!order) throw new NotFoundError('Order not found');
    return order;
  }
}
