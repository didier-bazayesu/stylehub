import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { VendorsService } from '../vendors/vendors.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, UpdateOrderItemStatusDto } from './dto';
import { PaginationQueryDto } from '../common/dto';
export declare class OrdersService {
    private prisma;
    private cartService;
    private vendorsService;
    private notificationsService;
    constructor(prisma: PrismaService, cartService: CartService, vendorsService: VendorsService, notificationsService: NotificationsService);
    create(userId: string, dto: CreateOrderDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: Prisma.Decimal;
        shipping_cost: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        coupon_code: string | null;
        notes: string | null;
        created_at: Date;
        updated_at: Date;
        address: {
            id: string;
            user_id: string;
            phone: string;
            full_name: string;
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            postal_code: string;
            country: string;
            is_default: boolean;
        };
        payment: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            created_at: Date;
            order_id: string;
            stripe_payment_intent: string;
            amount: Prisma.Decimal;
            currency: string;
            paid_at: Date | null;
        } | null;
        items: {
            id: string;
            quantity: number;
            unit_price: Prisma.Decimal;
            total_price: Prisma.Decimal;
            status: import("@prisma/client").$Enums.OrderStatus;
            product: {
                image: string;
                id: string;
                name: string;
                slug: string;
                images: {
                    url: string;
                }[];
            } | {
                id: null;
                name: string;
                slug: null;
                image: null;
            };
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
            } | null;
            vendor: {
                store: {
                    name: string;
                    slug: string;
                } | null;
                id: string;
                business_name: string;
            };
        }[];
    }>;
    findAllForUser(userId: string, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            subtotal: Prisma.Decimal;
            shipping_cost: Prisma.Decimal;
            discount: Prisma.Decimal;
            total: Prisma.Decimal;
            item_count: number;
            payment_status: import("@prisma/client").$Enums.PaymentStatus | null;
            created_at: Date;
            items: {
                id: string;
                quantity: number;
                total_price: Prisma.Decimal;
                status: import("@prisma/client").$Enums.OrderStatus;
                product: {
                    id: string;
                    name: string;
                    slug: string;
                } | null;
            }[];
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(userId: string, orderId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: Prisma.Decimal;
        shipping_cost: Prisma.Decimal;
        discount: Prisma.Decimal;
        total: Prisma.Decimal;
        coupon_code: string | null;
        notes: string | null;
        created_at: Date;
        updated_at: Date;
        address: {
            id: string;
            user_id: string;
            phone: string;
            full_name: string;
            line1: string;
            line2: string | null;
            city: string;
            state: string;
            postal_code: string;
            country: string;
            is_default: boolean;
        };
        payment: {
            id: string;
            status: import("@prisma/client").$Enums.PaymentStatus;
            created_at: Date;
            order_id: string;
            stripe_payment_intent: string;
            amount: Prisma.Decimal;
            currency: string;
            paid_at: Date | null;
        } | null;
        items: {
            id: string;
            quantity: number;
            unit_price: Prisma.Decimal;
            total_price: Prisma.Decimal;
            status: import("@prisma/client").$Enums.OrderStatus;
            product: {
                image: string;
                id: string;
                name: string;
                slug: string;
                images: {
                    url: string;
                }[];
            } | {
                id: null;
                name: string;
                slug: null;
                image: null;
            };
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
            } | null;
            vendor: {
                store: {
                    name: string;
                    slug: string;
                } | null;
                id: string;
                business_name: string;
            };
        }[];
    }>;
    findAllForVendor(userId: string, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            quantity: number;
            unit_price: Prisma.Decimal;
            total_price: Prisma.Decimal;
            status: import("@prisma/client").$Enums.OrderStatus;
            order: {
                user: {
                    id: string;
                    email: string;
                    first_name: string;
                    last_name: string;
                };
                address: {
                    id: string;
                    user_id: string;
                    phone: string;
                    full_name: string;
                    line1: string;
                    line2: string | null;
                    city: string;
                    state: string;
                    postal_code: string;
                    country: string;
                    is_default: boolean;
                };
                id: string;
                status: import("@prisma/client").$Enums.OrderStatus;
                created_at: Date;
            };
            product: {
                id: string;
                name: string;
                slug: string;
            } | null;
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
            } | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateOrderItemStatus(userId: string, orderItemId: string, dto: UpdateOrderItemStatusDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        product: {
            id: string;
            name: string;
            slug: string;
        } | null;
        variant: {
            id: string;
            sku: string;
            size: string | null;
            color: string | null;
        } | null;
        message: string;
    }>;
    adminCancelOrderItem(orderItemId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        message: string;
    }>;
    adminRefundOrderItem(orderItemId: string): Promise<{
        id: string;
        status: "REFUNDED";
        message: string;
    }>;
    sendRefundNotifications(orderId: string, orderItemId: string): Promise<void>;
    private sendOrderItemStatusNotifications;
    private notifyVendorsOfNewOrder;
    private formatOrderRef;
    private validateCoupon;
    private calculateDiscount;
    private orderSummaryInclude;
    private orderDetailInclude;
    private mapOrderSummary;
    private mapOrderDetail;
    private getCustomerStatusTitle;
    private getCustomerStatusMessage;
}
