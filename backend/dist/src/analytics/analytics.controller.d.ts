import { AnalyticsService } from './analytics.service';
import { AnalyticsPeriod, AnalyticsPeriodDto } from './dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getVendorOverview(userId: string): Promise<{
        period: AnalyticsPeriod;
        revenue: number;
        orders: number;
        units_sold: number;
        products: number;
        top_products: {
            product_id: string;
            name: string;
            slug: string;
            revenue: number;
            units_sold: number;
        }[];
    }>;
    getVendorRevenue(userId: string, query: AnalyticsPeriodDto): Promise<{
        period: AnalyticsPeriod;
        data: {
            date: string;
            revenue: number;
            orders: number;
        }[];
        total_revenue: number;
    }>;
    getVendorTopProducts(userId: string): Promise<{
        period: AnalyticsPeriod;
        products: {
            product_id: string;
            name: string;
            slug: string;
            revenue: number;
            units_sold: number;
        }[];
    }>;
    getAdminOverview(): Promise<{
        period: AnalyticsPeriod;
        total_users: number;
        total_vendors: number;
        total_products: number;
        revenue: number;
        orders: number;
        recent_orders: {
            user: {
                email: string;
                first_name: string;
                last_name: string;
            };
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            created_at: Date;
            total: import("@prisma/client-runtime-utils").Decimal;
        }[];
    }>;
    getAdminVendors(): Promise<{
        id: string;
        business_name: string;
        store: {
            name: string;
            slug: string;
        } | null;
        product_count: number;
        revenue: number;
        orders: number;
        units_sold: number;
    }[]>;
}
