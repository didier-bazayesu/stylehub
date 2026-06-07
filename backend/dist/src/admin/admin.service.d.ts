import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminUsersQueryDto, UpdateUserStatusDto, AdminVendorsQueryDto, RejectVendorDto, AdminProductsQueryDto, AdminOrdersQueryDto, CreateCouponDto, UpdateCouponDto } from './dto';
import { PaginationQueryDto } from '../common/dto';
export declare class AdminService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    listUsers(query: AdminUsersQueryDto): Promise<{
        data: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: import("@prisma/client").$Enums.Role;
            is_verified: boolean;
            is_active: boolean;
            created_at: Date;
            vendor: {
                id: string;
                status: import("@prisma/client").$Enums.VendorStatus;
                business_name: string;
            } | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUserStatus(adminId: string, userId: string, dto: UpdateUserStatusDto, ipAddress?: string): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: import("@prisma/client").$Enums.Role;
        is_active: boolean;
    }>;
    listVendors(query: AdminVendorsQueryDto): Promise<{
        data: {
            id: string;
            status: import("@prisma/client").$Enums.VendorStatus;
            business_name: string;
            business_email: string;
            description: string | null;
            rejection_reason: string | null;
            product_count: number;
            user: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
            store: {
                id: string;
                name: string;
                slug: string;
            } | null;
            created_at: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    approveVendor(adminId: string, vendorId: string, ipAddress?: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.VendorStatus;
        message: string;
    }>;
    rejectVendor(adminId: string, vendorId: string, dto: RejectVendorDto, ipAddress?: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.VendorStatus;
        rejection_reason: string | null;
        message: string;
    }>;
    suspendVendor(adminId: string, vendorId: string, ipAddress?: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.VendorStatus;
        message: string;
    }>;
    listProducts(query: AdminProductsQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            slug: string;
            base_price: Prisma.Decimal;
            status: import("@prisma/client").$Enums.ProductStatus;
            total_stock: number;
            image: string;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            vendor: {
                id: string;
                store: {
                    name: string;
                    slug: string;
                } | null;
                business_name: string;
            };
            created_at: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    forceDeleteProduct(adminId: string, productId: string, ipAddress?: string): Promise<{
        message: string;
    }>;
    listOrders(query: AdminOrdersQueryDto): Promise<{
        data: {
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            subtotal: Prisma.Decimal;
            total: Prisma.Decimal;
            item_count: number;
            payment_status: import("@prisma/client").$Enums.PaymentStatus | null;
            user: {
                id: string;
                email: string;
                first_name: string;
                last_name: string;
            };
            created_at: Date;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    listAuditLogs(query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            created_at: Date;
            user_id: string | null;
            action: string;
            entity: string;
            entity_id: string | null;
            old_value: Prisma.JsonValue | null;
            new_value: Prisma.JsonValue | null;
            ip_address: string | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    listCoupons(): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        min_order: Prisma.Decimal | null;
        max_uses: number | null;
        uses_count: number;
        expires_at: Date | null;
    }[]>;
    createCoupon(adminId: string, dto: CreateCouponDto, ipAddress?: string): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        min_order: Prisma.Decimal | null;
        max_uses: number | null;
        uses_count: number;
        expires_at: Date | null;
    }>;
    updateCoupon(adminId: string, couponId: string, dto: UpdateCouponDto, ipAddress?: string): Promise<{
        id: string;
        is_active: boolean;
        created_at: Date;
        code: string;
        discount_type: string;
        discount_value: Prisma.Decimal;
        min_order: Prisma.Decimal | null;
        max_uses: number | null;
        uses_count: number;
        expires_at: Date | null;
    }>;
    deleteCoupon(adminId: string, couponId: string, ipAddress?: string): Promise<{
        message: string;
    }>;
    private findVendor;
    private logAudit;
}
