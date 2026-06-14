import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderItemStatusDto } from './dto';
import { PaginationQueryDto } from '../common/dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(userId: string, dto: CreateOrderDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.OrderStatus;
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        shipping_cost: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        coupon_code: string | null;
        notes: string | null;
        created_at: Date;
        updated_at: Date;
        address: {
            id: string;
            phone: string;
            user_id: string;
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
            created_at: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            order_id: string;
            stripe_payment_intent: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            paid_at: Date | null;
        } | null;
        items: {
            id: string;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            total_price: import("@prisma/client-runtime-utils").Decimal;
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
                id: string;
                store: {
                    name: string;
                    slug: string;
                } | null;
                business_name: string;
            };
        }[];
    }>;
    findAllForVendor(userId: string, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            total_price: import("@prisma/client-runtime-utils").Decimal;
            status: import("@prisma/client").$Enums.OrderStatus;
            order: {
                id: string;
                created_at: Date;
                user: {
                    id: string;
                    email: string;
                    first_name: string;
                    last_name: string;
                };
                address: {
                    id: string;
                    phone: string;
                    user_id: string;
                    full_name: string;
                    line1: string;
                    line2: string | null;
                    city: string;
                    state: string;
                    postal_code: string;
                    country: string;
                    is_default: boolean;
                };
                status: import("@prisma/client").$Enums.OrderStatus;
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
    findAll(userId: string, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            status: import("@prisma/client").$Enums.OrderStatus;
            subtotal: import("@prisma/client-runtime-utils").Decimal;
            shipping_cost: import("@prisma/client-runtime-utils").Decimal;
            discount: import("@prisma/client-runtime-utils").Decimal;
            total: import("@prisma/client-runtime-utils").Decimal;
            item_count: number;
            payment_status: import("@prisma/client").$Enums.PaymentStatus | null;
            created_at: Date;
            items: {
                id: string;
                quantity: number;
                total_price: import("@prisma/client-runtime-utils").Decimal;
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
        subtotal: import("@prisma/client-runtime-utils").Decimal;
        shipping_cost: import("@prisma/client-runtime-utils").Decimal;
        discount: import("@prisma/client-runtime-utils").Decimal;
        total: import("@prisma/client-runtime-utils").Decimal;
        coupon_code: string | null;
        notes: string | null;
        created_at: Date;
        updated_at: Date;
        address: {
            id: string;
            phone: string;
            user_id: string;
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
            created_at: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            order_id: string;
            stripe_payment_intent: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            paid_at: Date | null;
        } | null;
        items: {
            id: string;
            quantity: number;
            unit_price: import("@prisma/client-runtime-utils").Decimal;
            total_price: import("@prisma/client-runtime-utils").Decimal;
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
                id: string;
                store: {
                    name: string;
                    slug: string;
                } | null;
                business_name: string;
            };
        }[];
    }>;
}
