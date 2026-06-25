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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const cart_service_1 = require("../cart/cart.service");
const vendors_service_1 = require("../vendors/vendors.service");
const notifications_service_1 = require("../notifications/notifications.service");
const FLAT_SHIPPING_COST = 9.99;
let OrdersService = class OrdersService {
    prisma;
    cartService;
    vendorsService;
    notificationsService;
    constructor(prisma, cartService, vendorsService, notificationsService) {
        this.prisma = prisma;
        this.cartService = cartService;
        this.vendorsService = vendorsService;
        this.notificationsService = notificationsService;
    }
    async create(userId, dto) {
        const cart = await this.cartService.getCartWithItems(userId);
        if (!cart || cart.items.length === 0) {
            throw new common_1.UnprocessableEntityException({
                code: 'CART_EMPTY',
                message: 'Your cart is empty. Add items before checkout.',
            });
        }
        const address = await this.prisma.address.findFirst({
            where: { id: dto.address_id, user_id: userId },
        });
        if (!address) {
            throw new common_1.NotFoundException({
                code: 'ADDRESS_NOT_FOUND',
                message: 'Shipping address not found.',
            });
        }
        for (const item of cart.items) {
            if (item.product.deleted_at !== null ||
                item.product.status !== client_1.ProductStatus.ACTIVE) {
                throw new common_1.UnprocessableEntityException({
                    code: 'PRODUCT_UNAVAILABLE',
                    message: `${item.product.name} is no longer available.`,
                });
            }
            if (item.quantity > item.variant.stock) {
                throw new common_1.UnprocessableEntityException({
                    code: 'INSUFFICIENT_STOCK',
                    message: `Insufficient stock for ${item.product.name}.`,
                });
            }
        }
        const subtotal = cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
        const coupon = dto.coupon_code
            ? await this.validateCoupon(dto.coupon_code, subtotal)
            : null;
        const discount = coupon ? this.calculateDiscount(coupon, subtotal) : 0;
        const shippingCost = FLAT_SHIPPING_COST;
        const total = Math.max(subtotal + shippingCost - discount, 0);
        const order = await this.prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    user_id: userId,
                    address_id: address.id,
                    status: client_1.OrderStatus.PENDING,
                    subtotal,
                    shipping_cost: shippingCost,
                    discount,
                    total,
                    coupon_code: coupon?.code,
                    notes: dto.notes,
                },
            });
            for (const item of cart.items) {
                const product = await tx.product.findFirstOrThrow({
                    where: { id: item.product_id },
                    select: { vendor_id: true },
                });
                const unitPrice = item.variant.price;
                const totalPrice = Number(unitPrice) * item.quantity;
                await tx.orderItem.create({
                    data: {
                        order_id: createdOrder.id,
                        product_id: item.product_id,
                        variant_id: item.variant_id,
                        vendor_id: product.vendor_id,
                        quantity: item.quantity,
                        unit_price: unitPrice,
                        total_price: totalPrice,
                        status: client_1.OrderStatus.PENDING,
                    },
                });
                await tx.productVariant.update({
                    where: { id: item.variant_id },
                    data: { stock: { decrement: item.quantity } },
                });
                const stockAggregate = await tx.productVariant.aggregate({
                    where: { product_id: item.product_id },
                    _sum: { stock: true },
                });
                await tx.product.update({
                    where: { id: item.product_id },
                    data: { total_stock: stockAggregate._sum.stock ?? 0 },
                });
            }
            if (coupon) {
                await tx.coupon.update({
                    where: { id: coupon.id },
                    data: { uses_count: { increment: 1 } },
                });
            }
            await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });
            return createdOrder;
        });
        await this.notifyVendorsOfNewOrder(order.id);
        const orderRef = this.formatOrderRef(order.id);
        await this.notificationsService.notifyCustomer(userId, {
            type: client_1.NotificationType.ORDER_UPDATE,
            title: 'Order placed',
            message: `Order ${orderRef} has been placed successfully. We'll notify you when payment is confirmed.`,
            data: { order_id: order.id },
        });
        return this.findById(userId, order.id);
    }
    async findAllForUser(userId, query) {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = { user_id: userId };
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: this.orderSummaryInclude(),
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            data: orders.map((order) => this.mapOrderSummary(order)),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findById(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, user_id: userId },
            include: this.orderDetailInclude(),
        });
        if (!order) {
            throw new common_1.NotFoundException({
                code: 'ORDER_NOT_FOUND',
                message: 'Order not found.',
            });
        }
        return this.mapOrderDetail(order);
    }
    async findAllForVendor(userId, query) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = { vendor_id: vendor.id };
        const [orderItems, total] = await Promise.all([
            this.prisma.orderItem.findMany({
                where,
                skip,
                take: limit,
                orderBy: { order: { created_at: 'desc' } },
                include: {
                    order: {
                        select: {
                            id: true,
                            status: true,
                            created_at: true,
                            user: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email: true,
                                },
                            },
                            address: true,
                        },
                    },
                    product: {
                        select: { id: true, name: true, slug: true },
                    },
                    variant: {
                        select: { id: true, sku: true, size: true, color: true },
                    },
                },
            }),
            this.prisma.orderItem.count({ where }),
        ]);
        return {
            data: orderItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                status: item.status,
                order: item.order,
                product: item.product,
                variant: item.variant,
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async updateOrderItemStatus(userId, orderItemId, dto) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const orderItem = await this.prisma.orderItem.findFirst({
            where: { id: orderItemId, vendor_id: vendor.id },
        });
        if (!orderItem) {
            throw new common_1.NotFoundException({
                code: 'ORDER_NOT_FOUND',
                message: 'Order item not found.',
            });
        }
        const allowedStatuses = [
            client_1.OrderStatus.CONFIRMED,
            client_1.OrderStatus.PROCESSING,
            client_1.OrderStatus.SHIPPED,
            client_1.OrderStatus.DELIVERED,
            client_1.OrderStatus.CANCELLED,
        ];
        if (!allowedStatuses.includes(dto.status)) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Invalid order item status.',
            });
        }
        const updated = await this.prisma.orderItem.update({
            where: { id: orderItemId },
            data: { status: dto.status },
            include: {
                product: { select: { id: true, name: true, slug: true } },
                variant: { select: { id: true, sku: true, size: true, color: true } },
                order: { select: { id: true, user_id: true } },
            },
        });
        await this.sendOrderItemStatusNotifications(updated, dto.status);
        return {
            id: updated.id,
            status: updated.status,
            product: updated.product,
            variant: updated.variant,
            message: 'Order item status updated successfully.',
        };
    }
    async adminCancelOrderItem(orderItemId) {
        const orderItem = await this.prisma.orderItem.findFirst({
            where: { id: orderItemId },
        });
        if (!orderItem) {
            throw new common_1.NotFoundException({
                code: 'ORDER_NOT_FOUND',
                message: 'Order item not found.',
            });
        }
        if (orderItem.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Order item is already cancelled.',
            });
        }
        const updated = await this.prisma.orderItem.update({
            where: { id: orderItemId },
            data: { status: client_1.OrderStatus.CANCELLED },
            include: {
                product: { select: { name: true } },
                order: { select: { id: true, user_id: true } },
            },
        });
        await this.sendOrderItemStatusNotifications(updated, client_1.OrderStatus.CANCELLED, {
            cancelledBy: 'admin',
        });
        return {
            id: updated.id,
            status: updated.status,
            message: 'Order item cancelled successfully.',
        };
    }
    async adminRefundOrderItem(orderItemId) {
        const orderItem = await this.prisma.orderItem.findFirst({
            where: { id: orderItemId },
        });
        if (!orderItem) {
            throw new common_1.NotFoundException({
                code: 'ORDER_NOT_FOUND',
                message: 'Order item not found.',
            });
        }
        if (orderItem.status === client_1.OrderStatus.REFUNDED) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Order item is already refunded.',
            });
        }
        await this.prisma.orderItem.update({
            where: { id: orderItemId },
            data: { status: client_1.OrderStatus.REFUNDED },
        });
        await this.sendRefundNotifications(orderItem.order_id, orderItemId);
        return {
            id: orderItemId,
            status: client_1.OrderStatus.REFUNDED,
            message: 'Order item refunded successfully.',
        };
    }
    async sendRefundNotifications(orderId, orderItemId) {
        const item = await this.prisma.orderItem.findFirst({
            where: { id: orderItemId, order_id: orderId },
            include: {
                order: { select: { id: true, user_id: true } },
                product: { select: { name: true } },
            },
        });
        if (!item) {
            return;
        }
        const productName = item.product?.name ?? item.product_name;
        const orderRef = this.formatOrderRef(orderId);
        await this.notificationsService.notifyCustomer(item.order.user_id, {
            type: client_1.NotificationType.ORDER_UPDATE,
            title: 'Refund issued',
            message: `A refund has been issued for order ${orderRef} ("${productName}").`,
            data: {
                order_id: orderId,
                order_item_id: orderItemId,
                status: client_1.OrderStatus.REFUNDED,
            },
        });
        await this.notificationsService.notifyAdmins({
            type: client_1.NotificationType.SYSTEM,
            title: 'Refund issued',
            message: `Refund issued for order ${orderRef} — "${productName}".`,
            data: { order_id: orderId, order_item_id: orderItemId },
        });
    }
    async sendOrderItemStatusNotifications(updated, status, options) {
        const productName = updated.product?.name ?? updated.product_name;
        const orderRef = this.formatOrderRef(updated.order.id);
        const notificationData = {
            order_id: updated.order.id,
            order_item_id: updated.id,
            status,
        };
        await this.notificationsService.notifyCustomer(updated.order.user_id, {
            type: client_1.NotificationType.ORDER_UPDATE,
            title: this.getCustomerStatusTitle(status),
            message: this.getCustomerStatusMessage(status, productName, orderRef),
            data: notificationData,
        });
        if (status === client_1.OrderStatus.DELIVERED) {
            const vendor = await this.prisma.vendor.findFirst({
                where: { id: updated.vendor_id },
                select: { user_id: true },
            });
            if (vendor) {
                await this.notificationsService.notifyVendor(vendor.user_id, {
                    type: client_1.NotificationType.ORDER_UPDATE,
                    title: 'Item delivered',
                    message: `"${productName}" from order ${orderRef} was delivered. Sale complete.`,
                    data: notificationData,
                });
            }
        }
        if (status === client_1.OrderStatus.CANCELLED) {
            const vendor = await this.prisma.vendor.findFirst({
                where: { id: updated.vendor_id },
                select: { user_id: true },
            });
            if (vendor) {
                const cancelledBy = options?.cancelledBy ?? 'vendor';
                await this.notificationsService.notifyVendor(vendor.user_id, {
                    type: client_1.NotificationType.ORDER_UPDATE,
                    title: 'Item cancelled',
                    message: cancelledBy === 'admin'
                        ? `"${productName}" from order ${orderRef} was cancelled by admin.`
                        : `"${productName}" from order ${orderRef} was cancelled.`,
                    data: notificationData,
                });
            }
            await this.notificationsService.notifyAdmins({
                type: client_1.NotificationType.SYSTEM,
                title: 'Order item cancelled',
                message: `Order item "${productName}" (${orderRef}) was cancelled.`,
                data: notificationData,
            });
        }
    }
    async notifyVendorsOfNewOrder(orderId) {
        const orderItems = await this.prisma.orderItem.findMany({
            where: { order_id: orderId },
            include: {
                product: { select: { name: true } },
                vendor: { select: { user_id: true } },
            },
        });
        const orderRef = this.formatOrderRef(orderId);
        const notifiedVendors = new Set();
        for (const item of orderItems) {
            if (notifiedVendors.has(item.vendor.user_id)) {
                continue;
            }
            notifiedVendors.add(item.vendor.user_id);
            await this.notificationsService.notifyVendor(item.vendor.user_id, {
                type: client_1.NotificationType.ORDER_UPDATE,
                title: 'New order received',
                message: `You received a new order (${orderRef}) including "${item.product?.name ?? item.product_name ?? 'a product'}".`,
                data: { order_id: orderId },
            });
        }
    }
    formatOrderRef(orderId) {
        return `#${orderId.slice(-8).toUpperCase()}`;
    }
    async validateCoupon(code, subtotal) {
        const coupon = await this.prisma.coupon.findFirst({
            where: {
                code: code.toUpperCase(),
                is_active: true,
            },
        });
        if (!coupon) {
            throw new common_1.UnprocessableEntityException({
                code: 'INVALID_COUPON',
                message: 'Coupon code is invalid or expired.',
            });
        }
        if (coupon.expires_at && coupon.expires_at < new Date()) {
            throw new common_1.UnprocessableEntityException({
                code: 'INVALID_COUPON',
                message: 'Coupon code is invalid or expired.',
            });
        }
        if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
            throw new common_1.UnprocessableEntityException({
                code: 'INVALID_COUPON',
                message: 'Coupon code has reached its usage limit.',
            });
        }
        if (coupon.min_order && subtotal < Number(coupon.min_order)) {
            throw new common_1.UnprocessableEntityException({
                code: 'INVALID_COUPON',
                message: `Minimum order amount of $${coupon.min_order} required for this coupon.`,
            });
        }
        return coupon;
    }
    calculateDiscount(coupon, subtotal) {
        if (coupon.discount_type === 'percentage') {
            return Math.min(subtotal * (Number(coupon.discount_value) / 100), subtotal);
        }
        return Math.min(Number(coupon.discount_value), subtotal);
    }
    orderSummaryInclude() {
        return {
            items: {
                include: {
                    product: { select: { id: true, name: true, slug: true } },
                },
            },
            payment: {
                select: { status: true },
            },
        };
    }
    orderDetailInclude() {
        return {
            address: true,
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            images: {
                                where: { is_primary: true },
                                take: 1,
                                select: { url: true },
                            },
                        },
                    },
                    variant: {
                        select: { id: true, sku: true, size: true, color: true },
                    },
                    vendor: {
                        select: {
                            id: true,
                            business_name: true,
                            store: { select: { name: true, slug: true } },
                        },
                    },
                },
            },
            payment: true,
        };
    }
    mapOrderSummary(order) {
        return {
            id: order.id,
            status: order.status,
            subtotal: order.subtotal,
            shipping_cost: order.shipping_cost,
            discount: order.discount,
            total: order.total,
            item_count: order.items.length,
            payment_status: order.payment?.status ?? null,
            created_at: order.created_at,
            items: order.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                total_price: item.total_price,
                status: item.status,
                product: item.product,
            })),
        };
    }
    mapOrderDetail(order) {
        return {
            id: order.id,
            status: order.status,
            subtotal: order.subtotal,
            shipping_cost: order.shipping_cost,
            discount: order.discount,
            total: order.total,
            coupon_code: order.coupon_code,
            notes: order.notes,
            created_at: order.created_at,
            updated_at: order.updated_at,
            address: order.address,
            payment: order.payment,
            items: order.items.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                status: item.status,
                product: item.product
                    ? {
                        ...item.product,
                        image: item.product.images[0]?.url ?? null,
                    }
                    : {
                        id: null,
                        name: item.product_name,
                        slug: null,
                        image: null,
                    },
                variant: item.variant,
                vendor: item.vendor,
            })),
        };
    }
    getCustomerStatusTitle(status) {
        switch (status) {
            case client_1.OrderStatus.CONFIRMED:
                return 'Order confirmed';
            case client_1.OrderStatus.PROCESSING:
                return 'Order processing';
            case client_1.OrderStatus.SHIPPED:
                return 'Order shipped';
            case client_1.OrderStatus.DELIVERED:
                return 'Order delivered';
            case client_1.OrderStatus.CANCELLED:
                return 'Order cancelled';
            case client_1.OrderStatus.REFUNDED:
                return 'Refund issued';
            default:
                return 'Order status updated';
        }
    }
    getCustomerStatusMessage(status, productName, orderRef) {
        switch (status) {
            case client_1.OrderStatus.CONFIRMED:
                return `Your order ${orderRef} for "${productName}" has been confirmed.`;
            case client_1.OrderStatus.PROCESSING:
                return `Your order ${orderRef} for "${productName}" is being packed and prepared.`;
            case client_1.OrderStatus.SHIPPED:
                return `"${productName}" from order ${orderRef} has shipped and is on its way.`;
            case client_1.OrderStatus.DELIVERED:
                return `"${productName}" from order ${orderRef} has been delivered. Enjoy your purchase!`;
            case client_1.OrderStatus.CANCELLED:
                return `Your order ${orderRef} for "${productName}" has been cancelled.`;
            case client_1.OrderStatus.REFUNDED:
                return `A refund has been issued for "${productName}" on order ${orderRef}.`;
            default:
                return `Your order ${orderRef} for "${productName}" status changed to ${status.toLowerCase()}.`;
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cart_service_1.CartService,
        vendors_service_1.VendorsService,
        notifications_service_1.NotificationsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map