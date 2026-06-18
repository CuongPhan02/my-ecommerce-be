import { DashboardRepository } from './dashboard.repository';

export class DashboardService {
  private repo: DashboardRepository;

  constructor(repo: DashboardRepository) {
    this.repo = repo;
  }

  async getDashboardData() {
    const [stats, revenueOverview, recentSales, salesByCategory, notifications, trafficData] = await Promise.all([
      this.repo.getStats(),
      this.repo.getRevenueOverview(),
      this.repo.getRecentSales(),
      this.repo.getSalesByCategory(),
      this.repo.getNotifications(),
      this.repo.getTrafficData(),
    ]);

    return {
      stats,
      revenueOverview,
      recentSales,
      salesByCategory,
      notifications,
      trafficData,
    };
  }
}
