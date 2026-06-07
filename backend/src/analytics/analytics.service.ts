import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VendorsService } from '../vendors/vendors.service';
import { AnalyticsPeriod } from './dto';

const COMPLETED_ITEM_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private vendorsService: VendorsService,
  ) {}

  async getVendorOverview(userId: string) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const startDate = this.getStartDate(AnalyticsPeriod.THIRTY_DAYS);

    const orderItems = await this.getVendorOrderItems(vendor.id, startDate);

    const revenue = orderItems.reduce(
      (sum, item) => sum + Number(item.total_price),
      0,
    );
    const unitsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const orderIds = new Set(orderItems.map((item) => item.order_id));

    const [productCount, topProducts] = await Promise.all([
      this.prisma.product.count({
        where: { vendor_id: vendor.id, deleted_at: null },
      }),
      this.getTopProducts(vendor.id, startDate, 5),
    ]);

    return {
      period: AnalyticsPeriod.THIRTY_DAYS,
      revenue,
      orders: orderIds.size,
      units_sold: unitsSold,
      products: productCount,
      top_products: topProducts,
    };
  }

  async getVendorRevenue(userId: string, period: AnalyticsPeriod) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const startDate = this.getStartDate(period);
    const orderItems = await this.getVendorOrderItems(vendor.id, startDate);

    const revenueByDate = new Map<string, { revenue: number; orders: number }>();

    for (const item of orderItems) {
      const dateKey = item.order.created_at.toISOString().slice(0, 10);
      const current = revenueByDate.get(dateKey) ?? { revenue: 0, orders: 0 };
      current.revenue += Number(item.total_price);
      revenueByDate.set(dateKey, current);
    }

    const uniqueOrdersByDate = new Map<string, Set<string>>();
    for (const item of orderItems) {
      const dateKey = item.order.created_at.toISOString().slice(0, 10);
      const orders = uniqueOrdersByDate.get(dateKey) ?? new Set<string>();
      orders.add(item.order_id);
      uniqueOrdersByDate.set(dateKey, orders);
    }

    const chart = [...revenueByDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({
        date,
        revenue: values.revenue,
        orders: uniqueOrdersByDate.get(date)?.size ?? 0,
      }));

    return {
      period,
      data: chart,
      total_revenue: chart.reduce((sum, point) => sum + point.revenue, 0),
    };
  }

  async getVendorTopProducts(userId: string) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const startDate = this.getStartDate(AnalyticsPeriod.THIRTY_DAYS);

    return {
      period: AnalyticsPeriod.THIRTY_DAYS,
      products: await this.getTopProducts(vendor.id, startDate, 10),
    };
  }

  async getAdminOverview() {
    const startDate = this.getStartDate(AnalyticsPeriod.THIRTY_DAYS);

    const [
      totalUsers,
      totalVendors,
      totalProducts,
      orderItems,
      recentOrders,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deleted_at: null } }),
      this.prisma.vendor.count({
        where: { deleted_at: null, status: 'APPROVED' },
      }),
      this.prisma.product.count({ where: { deleted_at: null } }),
      this.prisma.orderItem.findMany({
        where: {
          status: { in: COMPLETED_ITEM_STATUSES },
          order: {
            created_at: { gte: startDate },
            payment: { status: PaymentStatus.COMPLETED },
          },
        },
        select: { total_price: true, order_id: true },
      }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          status: true,
          total: true,
          created_at: true,
          user: {
            select: { first_name: true, last_name: true, email: true },
          },
        },
      }),
    ]);

    const revenue = orderItems.reduce(
      (sum, item) => sum + Number(item.total_price),
      0,
    );
    const orderCount = new Set(orderItems.map((item) => item.order_id)).size;

    return {
      period: AnalyticsPeriod.THIRTY_DAYS,
      total_users: totalUsers,
      total_vendors: totalVendors,
      total_products: totalProducts,
      revenue,
      orders: orderCount,
      recent_orders: recentOrders,
    };
  }

  async getAdminVendors() {
    const startDate = this.getStartDate(AnalyticsPeriod.THIRTY_DAYS);

    const vendors = await this.prisma.vendor.findMany({
      where: { deleted_at: null, status: 'APPROVED' },
      include: {
        store: { select: { name: true, slug: true } },
        products: {
          where: { deleted_at: null },
          select: { id: true },
        },
      },
      orderBy: { business_name: 'asc' },
    });

    const performance = await Promise.all(
      vendors.map(async (vendor) => {
        const orderItems = await this.getVendorOrderItems(vendor.id, startDate);
        const revenue = orderItems.reduce(
          (sum, item) => sum + Number(item.total_price),
          0,
        );
        const orderIds = new Set(orderItems.map((item) => item.order_id));

        return {
          id: vendor.id,
          business_name: vendor.business_name,
          store: vendor.store,
          product_count: vendor.products.length,
          revenue,
          orders: orderIds.size,
          units_sold: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        };
      }),
    );

    return performance.sort((a, b) => b.revenue - a.revenue);
  }

  private async getVendorOrderItems(vendorId: string, startDate: Date) {
    return this.prisma.orderItem.findMany({
      where: {
        vendor_id: vendorId,
        status: { in: COMPLETED_ITEM_STATUSES },
        order: {
          created_at: { gte: startDate },
          payment: { status: PaymentStatus.COMPLETED },
        },
      },
      include: {
        order: { select: { id: true, created_at: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  private async getTopProducts(
    vendorId: string,
    startDate: Date,
    limit: number,
  ) {
    const orderItems = await this.getVendorOrderItems(vendorId, startDate);

    const productMap = new Map<
      string,
      {
        product_id: string;
        name: string;
        slug: string;
        revenue: number;
        units_sold: number;
      }
    >();

    for (const item of orderItems) {
      const existing = productMap.get(item.product_id) ?? {
        product_id: item.product_id,
        name: item.product.name,
        slug: item.product.slug,
        revenue: 0,
        units_sold: 0,
      };

      existing.revenue += Number(item.total_price);
      existing.units_sold += item.quantity;
      productMap.set(item.product_id, existing);
    }

    return [...productMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  private getStartDate(period: AnalyticsPeriod): Date {
    const now = new Date();
    const start = new Date(now);

    switch (period) {
      case AnalyticsPeriod.SEVEN_DAYS:
        start.setDate(now.getDate() - 7);
        break;
      case AnalyticsPeriod.NINETY_DAYS:
        start.setDate(now.getDate() - 90);
        break;
      case AnalyticsPeriod.ONE_YEAR:
        start.setFullYear(now.getFullYear() - 1);
        break;
      case AnalyticsPeriod.THIRTY_DAYS:
      default:
        start.setDate(now.getDate() - 30);
        break;
    }

    start.setHours(0, 0, 0, 0);
    return start;
  }
}
