import { eq, sql, and, ne, desc, sum, count } from 'drizzle-orm';
import { orders, payments } from '@/db/schema/orders';
import { products } from '@/db/schema/products';
import { users } from '@/db/schema/users';
import { coupons } from '@/db/schema/orders';
import { formatVND } from '@/utils/lib';

export class DashboardRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async getStats() {
    // 1. Tổng doanh thu (Các đơn hàng đã hoàn thành hoặc đang xử lý, trừ đơn đã hủy)
    const [revenueRes] = await this.db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(ne(orders.status, 'CANCELLED'));
    
    const totalRevenue = Number(revenueRes?.total || 0);

    // 2. Đơn hàng mới (Số đơn hàng trong tháng này)
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const [ordersRes] = await this.db
      .select({ count: count(orders.id) })
      .from(orders)
      .where(sql`${orders.createdAt} >= ${firstDayOfMonth}`);
    
    const newOrdersCount = Number(ordersRes?.count || 0);

    // 3. Tổng sản phẩm
    const [productsRes] = await this.db
      .select({ count: count(products.id) })
      .from(products);
    
    const totalProducts = Number(productsRes?.count || 0);

    // 4. Voucher đang hoạt động
    const [vouchersRes] = await this.db
      .select({ count: count(coupons.id) })
      .from(coupons)
      .where(eq(coupons.isActive, true));
    
    const activeVouchers = Number(vouchersRes?.count || 0);

    return {
      totalRevenue,
      totalRevenueFormatted: formatVND(totalRevenue),
      newOrdersCount,
      totalProducts,
      activeVouchers,
    };
  }

  async getRevenueOverview() {
    // Thống kê doanh thu theo tháng trong năm nay
    const currentYear = new Date().getFullYear();
    
    const revenueByMonth = await this.db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${orders.createdAt})`,
        total: sum(orders.totalAmount),
      })
      .from(orders)
      .where(
        and(
          ne(orders.status, 'CANCELLED'),
          sql`EXTRACT(YEAR FROM ${orders.createdAt}) = ${currentYear}`
        )
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${orders.createdAt})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${orders.createdAt})`);

    // Map kết quả sang mảng 12 tháng
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const overview = monthNames.map((name, index) => {
      const monthData = revenueByMonth.find((d: any) => Number(d.month) === index + 1);
      return {
        name,
        total: Number(monthData?.total || 0),
      };
    });

    return overview;
  }

  async getRecentSales() {
    // 5 đơn hàng gần nhất
    const recentOrders = await this.db
      .select({
        id: orders.id,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        customer: {
          name: users.name,
          email: users.email,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt))
      .limit(5);

    return recentOrders.map((order: any) => ({
      ...order,
      totalAmountFormatted: formatVND(order.totalAmount),
    }));
  }
}
