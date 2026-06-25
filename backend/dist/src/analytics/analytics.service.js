"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const vendors_service_1 = require("../vendors/vendors.service");
const dto_1 = require("./dto");
const COMPLETED_ITEM_STATUSES = [
    client_1.OrderStatus.CONFIRMED,
    client_1.OrderStatus.PROCESSING,
    client_1.OrderStatus.SHIPPED,
    client_1.OrderStatus.DELIVERED,
];
let AnalyticsService = class AnalyticsService {
    prisma;
    vendorsService;
    constructor(prisma, vendorsService) {
        this.prisma = prisma;
        this.vendorsService = vendorsService;
    }
    async getVendorOverview(userId) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const startDate = this.getStartDate(dto_1.AnalyticsPeriod.THIRTY_DAYS);
        const orderItems = await this.getVendorOrderItems(vendor.id, startDate);
        const revenue = orderItems.reduce((sum, item) => sum + Number(item.total_price), 0);
        const unitsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const orderIds = new Set(orderItems.map((item) => item.order_id));
        const [productCount, topProducts] = await Promise.all([
            this.prisma.product.count({
                where: { vendor_id: vendor.id, deleted_at: null },
            }),
            this.getTopProducts(vendor.id, startDate, 5),
        ]);
        return {
            period: dto_1.AnalyticsPeriod.THIRTY_DAYS,
            revenue,
            orders: orderIds.size,
            units_sold: unitsSold,
            products: productCount,
            top_products: topProducts,
        };
    }
    async getVendorRevenue(userId, period) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const startDate = this.getStartDate(period);
        const orderItems = await this.getVendorOrderItems(vendor.id, startDate);
        const revenueByDate = new Map();
        for (const item of orderItems) {
            const dateKey = item.order.created_at.toISOString().slice(0, 10);
            const current = revenueByDate.get(dateKey) ?? { revenue: 0, orders: 0 };
            current.revenue += Number(item.total_price);
            revenueByDate.set(dateKey, current);
        }
        const uniqueOrdersByDate = new Map();
        for (const item of orderItems) {
            const dateKey = item.order.created_at.toISOString().slice(0, 10);
            const orders = uniqueOrdersByDate.get(dateKey) ?? new Set();
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
    async getVendorTopProducts(userId) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const startDate = this.getStartDate(dto_1.AnalyticsPeriod.THIRTY_DAYS);
        return {
            period: dto_1.AnalyticsPeriod.THIRTY_DAYS,
            products: await this.getTopProducts(vendor.id, startDate, 10),
        };
    }
    async getAdminOverview() {
        const startDate = this.getStartDate(dto_1.AnalyticsPeriod.THIRTY_DAYS);
        const [totalUsers, totalVendors, totalProducts, orderItems, recentOrders,] = await Promise.all([
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
                        payment: { status: client_1.PaymentStatus.COMPLETED },
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
        const revenue = orderItems.reduce((sum, item) => sum + Number(item.total_price), 0);
        const orderCount = new Set(orderItems.map((item) => item.order_id)).size;
        return {
            period: dto_1.AnalyticsPeriod.THIRTY_DAYS,
            total_users: totalUsers,
            total_vendors: totalVendors,
            total_products: totalProducts,
            revenue,
            orders: orderCount,
            recent_orders: recentOrders,
        };
    }
    async getAdminVendors() {
        const startDate = this.getStartDate(dto_1.AnalyticsPeriod.THIRTY_DAYS);
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
        const performance = await Promise.all(vendors.map(async (vendor) => {
            const orderItems = await this.getVendorOrderItems(vendor.id, startDate);
            const revenue = orderItems.reduce((sum, item) => sum + Number(item.total_price), 0);
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
        }));
        return performance.sort((a, b) => b.revenue - a.revenue);
    }
    async getVendorOrderItems(vendorId, startDate) {
        return this.prisma.orderItem.findMany({
            where: {
                vendor_id: vendorId,
                status: { in: COMPLETED_ITEM_STATUSES },
                order: {
                    created_at: { gte: startDate },
                    payment: { status: client_1.PaymentStatus.COMPLETED },
                },
            },
            include: {
                order: { select: { id: true, created_at: true } },
                product: { select: { id: true, name: true, slug: true } },
            },
        });
    }
    async getTopProducts(vendorId, startDate, limit) {
        const orderItems = await this.getVendorOrderItems(vendorId, startDate);
        const productMap = new Map();
        for (const item of orderItems) {
            const productId = item.product_id ?? item.product_name;
            if (!productId)
                continue;
            const existing = productMap.get(productId) ?? {
                product_id: productId,
                name: item.product?.name ?? item.product_name ?? 'Deleted product',
                slug: item.product?.slug ?? '',
                revenue: 0,
                units_sold: 0,
            };
            existing.revenue += Number(item.total_price);
            existing.units_sold += item.quantity;
            productMap.set(productId, existing);
        }
        return [...productMap.values()]
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit);
    }
    getStartDate(period) {
        const now = new Date();
        const start = new Date(now);
        switch (period) {
            case dto_1.AnalyticsPeriod.SEVEN_DAYS:
                start.setDate(now.getDate() - 7);
                break;
            case dto_1.AnalyticsPeriod.NINETY_DAYS:
                start.setDate(now.getDate() - 90);
                break;
            case dto_1.AnalyticsPeriod.ONE_YEAR:
                start.setFullYear(now.getFullYear() - 1);
                break;
            case dto_1.AnalyticsPeriod.THIRTY_DAYS:
            default:
                start.setDate(now.getDate() - 30);
                break;
        }
        start.setHours(0, 0, 0, 0);
        return start;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vendors_service_1.VendorsService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map