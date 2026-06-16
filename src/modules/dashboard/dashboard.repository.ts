import { eq, sql, and, ne, desc, sum, count } from 'drizzle-orm';
import { orders, payments, coupons, orderItems, refundRequests } from '@/db/schema/orders';
import { products, productVariants, categories } from '@/db/schema/products';
import { users } from '@/db/schema/users';
import { reviews } from '@/db/schema/reviews';
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
        status: orders.status,
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

  async getSalesByCategory() {
    const currentYear = new Date().getFullYear();

    const salesData = await this.db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${orders.createdAt})`,
        categoryName: categories.name,
        amount: sum(sql`${orderItems.quantity} * ${orderItems.priceAtPurchase}`),
      })
      .from(orderItems)
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          ne(orders.status, 'CANCELLED'),
          sql`EXTRACT(YEAR FROM ${orders.createdAt}) = ${currentYear}`
        )
      )
      .groupBy(
        sql`EXTRACT(MONTH FROM ${orders.createdAt})`,
        categories.name
      );

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const overview = monthNames.map((name, index) => {
      const monthIndex = index + 1;
      const monthSales = salesData.filter((d: any) => Number(d.month) === monthIndex);

      const monthObj: any = { name };
      monthSales.forEach((s: any) => {
        const catName = s.categoryName || 'Khác';
        monthObj[catName] = Number(s.amount || 0);
      });

      return monthObj;
    });

    return overview;
  }

  async getNotifications() {
    try {
      const [recentOrders, recentReviews, recentRefunds, lowStockVariants] = await Promise.all([
        this.db
          .select({
            id: orders.id,
            totalAmount: orders.totalAmount,
            createdAt: orders.createdAt,
            customerName: users.name,
          })
          .from(orders)
          .leftJoin(users, eq(orders.userId, users.id))
          .orderBy(desc(orders.createdAt))
          .limit(3),
        
        this.db
          .select({
            id: reviews.id,
            rating: reviews.rating,
            createdAt: reviews.createdAt,
            customerName: users.name,
            productName: products.name,
          })
          .from(reviews)
          .leftJoin(users, eq(reviews.userId, users.id))
          .leftJoin(products, eq(reviews.productId, products.id))
          .orderBy(desc(reviews.createdAt))
          .limit(3),

        this.db
          .select({
            id: refundRequests.id,
            code: refundRequests.code,
            orderId: refundRequests.orderId,
            createdAt: refundRequests.createdAt,
            customerName: users.name,
          })
          .from(refundRequests)
          .leftJoin(users, eq(refundRequests.userId, users.id))
          .orderBy(desc(refundRequests.createdAt))
          .limit(3),

        this.db
          .select({
            id: productVariants.id,
            sku: productVariants.sku,
            stockQuantity: productVariants.stockQuantity,
            productName: products.name,
          })
          .from(productVariants)
          .leftJoin(products, eq(productVariants.productId, products.id))
          .where(sql`${productVariants.stockQuantity} <= ${productVariants.lowStockQuantity}`)
          .limit(3),
      ]);

      const items: any[] = [];

      // 1. New Orders
      recentOrders.forEach((o: any) => {
        items.push({
          id: `order-${o.id}`,
          type: 'ORDER',
          title: `Đơn hàng mới #${o.id.substring(0, 8).toUpperCase()}`,
          description: `${o.customerName || 'Khách hàng'} vừa đặt một đơn hàng trị giá ${formatVND(o.totalAmount)}.`,
          createdAt: o.createdAt,
        });
      });

      // 2. Reviews
      recentReviews.forEach((r: any) => {
        items.push({
          id: `review-${r.id}`,
          type: 'REVIEW',
          title: `Đánh giá ${r.rating} sao mới`,
          description: `${r.customerName || 'Khách hàng'} đã đánh giá ${r.rating} sao cho sản phẩm "${r.productName || 'Sản phẩm'}".`,
          createdAt: r.createdAt,
        });
      });

      // 3. Refund requests
      recentRefunds.forEach((rf: any) => {
        items.push({
          id: `refund-${rf.id}`,
          type: 'REFUND',
          title: `Yêu cầu đổi trả #${rf.code}`,
          description: `${rf.customerName || 'Khách hàng'} đã gửi yêu cầu hoàn tiền cho đơn hàng #${rf.orderId.substring(0, 8).toUpperCase()}.`,
          createdAt: rf.createdAt,
        });
      });

      // 4. Low stock variants
      lowStockVariants.forEach((v: any) => {
        items.push({
          id: `lowstock-${v.id}`,
          type: 'LOW_STOCK',
          title: 'Kho hàng - Sản phẩm sắp hết',
          description: `Biến thể ${v.sku} (${v.productName || 'Sản phẩm'}) chỉ còn ${v.stockQuantity} sản phẩm trong kho.`,
          createdAt: new Date(),
        });
      });

      // Sort by createdAt descending
      items.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Return top 10
      return items.slice(0, 10);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
}
