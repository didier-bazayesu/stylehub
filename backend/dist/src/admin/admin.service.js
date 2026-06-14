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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const orders_service_1 = require("../orders/orders.service");
let AdminService = class AdminService {
    prisma;
    notificationsService;
    ordersService;
    constructor(prisma, notificationsService, ordersService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.ordersService = ordersService;
    }
    async listUsers(query) {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = { deleted_at: null };
        if (query.role) {
            where.role = query.role;
        }
        if (query.search) {
            where.OR = [
                { email: { contains: query.search, mode: 'insensitive' } },
                { first_name: { contains: query.search, mode: 'insensitive' } },
                { last_name: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    role: true,
                    is_verified: true,
                    is_active: true,
                    created_at: true,
                    vendor: { select: { id: true, status: true, business_name: true } },
                },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async updateUserStatus(adminId, userId, dto, ipAddress) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deleted_at: null },
            include: { vendor: { select: { id: true, status: true, business_name: true } } },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'User not found.',
            });
        }
        if (user.role === client_1.Role.SUPER_ADMIN) {
            throw new common_1.BadRequestException({
                code: 'FORBIDDEN',
                message: 'Cannot deactivate a super admin account.',
            });
        }
        if (user.vendor) {
            if (dto.is_active === true) {
                await this.prisma.product.updateMany({
                    where: {
                        vendor_id: user.vendor.id,
                        deleted_at: null,
                        archive_reason: client_1.ArchiveReason.VENDOR_DISABLED,
                    },
                    data: {
                        status: client_1.ProductStatus.ACTIVE,
                        archive_reason: null,
                    },
                });
                await this.prisma.vendor.update({
                    where: { id: user.vendor.id },
                    data: { status: client_1.VendorStatus.APPROVED },
                });
                await this.notificationsService.create({
                    user_id: userId,
                    type: client_1.NotificationType.SYSTEM,
                    title: 'Account reactivated',
                    message: `Your vendor account "${user.vendor.business_name}" has been reactivated. Your active products have been restored.`,
                    data: { vendor_id: user.vendor.id },
                });
            }
            else {
                await this.prisma.product.updateMany({
                    where: {
                        vendor_id: user.vendor.id,
                        deleted_at: null,
                        status: { not: client_1.ProductStatus.ARCHIVED },
                    },
                    data: {
                        status: client_1.ProductStatus.ARCHIVED,
                        archive_reason: client_1.ArchiveReason.VENDOR_DISABLED,
                    },
                });
                await this.prisma.vendor.update({
                    where: { id: user.vendor.id },
                    data: { status: client_1.VendorStatus.SUSPENDED },
                });
                await this.notificationsService.create({
                    user_id: userId,
                    type: client_1.NotificationType.SYSTEM,
                    title: 'Account deactivated',
                    message: `Your vendor account "${user.vendor.business_name}" has been deactivated and your products have been hidden.`,
                    data: { vendor_id: user.vendor.id },
                });
            }
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                is_active: dto.is_active,
                ...(dto.is_active === false && { refresh_token: null }),
            },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                is_active: true,
            },
        });
        await this.logAudit({
            userId: adminId,
            action: dto.is_active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            entity: 'User',
            entityId: userId,
            oldValue: { is_active: user.is_active },
            newValue: { is_active: dto.is_active },
            ipAddress,
        });
        return updated;
    }
    async listVendors(query) {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = { deleted_at: null };
        if (query.status) {
            where.status = query.status;
        }
        const [vendors, total] = await Promise.all([
            this.prisma.vendor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                    store: { select: { id: true, name: true, slug: true } },
                    _count: { select: { products: true } },
                },
            }),
            this.prisma.vendor.count({ where }),
        ]);
        return {
            data: vendors.map((vendor) => ({
                id: vendor.id,
                status: vendor.status,
                business_name: vendor.business_name,
                business_email: vendor.business_email,
                description: vendor.description,
                rejection_reason: vendor.rejection_reason,
                product_count: vendor._count.products,
                user: vendor.user,
                store: vendor.store,
                created_at: vendor.created_at,
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async approveVendor(adminId, vendorId, ipAddress) {
        const vendor = await this.findVendor(vendorId);
        if (vendor.status === client_1.VendorStatus.APPROVED) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Vendor is already approved.',
            });
        }
        const updated = await this.prisma.vendor.update({
            where: { id: vendorId },
            data: {
                status: client_1.VendorStatus.APPROVED,
                rejection_reason: null,
            },
        });
        await this.logAudit({
            userId: adminId,
            action: 'APPROVE_VENDOR',
            entity: 'Vendor',
            entityId: vendorId,
            oldValue: { status: vendor.status },
            newValue: { status: client_1.VendorStatus.APPROVED },
            ipAddress,
        });
        await this.notificationsService.create({
            user_id: vendor.user_id,
            type: client_1.NotificationType.SYSTEM,
            title: 'Vendor application approved',
            message: `Congratulations! Your vendor account "${vendor.business_name}" has been approved.`,
            data: { vendor_id: vendorId },
        });
        return {
            id: updated.id,
            status: updated.status,
            message: 'Vendor approved successfully.',
        };
    }
    async rejectVendor(adminId, vendorId, dto, ipAddress) {
        const vendor = await this.findVendor(vendorId);
        const updated = await this.prisma.vendor.update({
            where: { id: vendorId },
            data: {
                status: client_1.VendorStatus.REJECTED,
                rejection_reason: dto.reason,
            },
        });
        await this.logAudit({
            userId: adminId,
            action: 'REJECT_VENDOR',
            entity: 'Vendor',
            entityId: vendorId,
            oldValue: { status: vendor.status },
            newValue: { status: client_1.VendorStatus.REJECTED, reason: dto.reason },
            ipAddress,
        });
        await this.notificationsService.create({
            user_id: vendor.user_id,
            type: client_1.NotificationType.SYSTEM,
            title: 'Vendor application rejected',
            message: `Your vendor application was rejected. Reason: ${dto.reason}`,
            data: { vendor_id: vendorId, reason: dto.reason },
        });
        return {
            id: updated.id,
            status: updated.status,
            rejection_reason: updated.rejection_reason,
            message: 'Vendor rejected successfully.',
        };
    }
    async suspendVendor(adminId, vendorId, ipAddress) {
        const vendor = await this.findVendor(vendorId);
        if (vendor.status === client_1.VendorStatus.SUSPENDED) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Vendor is already suspended.',
            });
        }
        const updated = await this.prisma.vendor.update({
            where: { id: vendorId },
            data: { status: client_1.VendorStatus.SUSPENDED },
        });
        await this.prisma.product.updateMany({
            where: { vendor_id: vendorId, deleted_at: null },
            data: { status: client_1.ProductStatus.ARCHIVED },
        });
        await this.logAudit({
            userId: adminId,
            action: 'SUSPEND_VENDOR',
            entity: 'Vendor',
            entityId: vendorId,
            oldValue: { status: vendor.status },
            newValue: { status: client_1.VendorStatus.SUSPENDED },
            ipAddress,
        });
        await this.notificationsService.create({
            user_id: vendor.user_id,
            type: client_1.NotificationType.SYSTEM,
            title: 'Vendor account suspended',
            message: `Your vendor account "${vendor.business_name}" has been suspended. Contact support for details.`,
            data: { vendor_id: vendorId },
        });
        return {
            id: updated.id,
            status: updated.status,
            message: 'Vendor suspended successfully.',
        };
    }
    async listProducts(query) {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = { deleted_at: null };
        if (query.status) {
            where.status = query.status;
        }
        if (query.vendor) {
            where.vendor = { store: { slug: query.vendor } };
        }
        if (query.category) {
            where.category = { slug: query.category };
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    category: { select: { id: true, name: true, slug: true } },
                    vendor: {
                        select: {
                            id: true,
                            business_name: true,
                            store: { select: { name: true, slug: true } },
                        },
                    },
                    images: {
                        where: { is_primary: true },
                        take: 1,
                        select: { url: true },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data: products.map((product) => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                base_price: product.base_price,
                status: product.status,
                total_stock: product.total_stock,
                image: product.images[0]?.url ?? null,
                category: product.category,
                vendor: product.vendor,
                created_at: product.created_at,
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async forceDeleteProduct(adminId, productId, ipAddress) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException({
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found.',
            });
        }
        const now = new Date();
        await this.prisma.product.update({
            where: { id: productId },
            data: {
                deleted_at: now,
                status: client_1.ProductStatus.ARCHIVED,
            },
        });
        await this.logAudit({
            userId: adminId,
            action: 'FORCE_DELETE_PRODUCT',
            entity: 'Product',
            entityId: productId,
            oldValue: { name: product.name, status: product.status },
            newValue: { deleted_at: now.toISOString(), status: client_1.ProductStatus.ARCHIVED },
            ipAddress,
        });
        return { message: 'Product removed successfully.' };
    }
    async listOrders(query) {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                    payment: { select: { status: true } },
                    _count: { select: { items: true } },
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            data: orders.map((order) => ({
                id: order.id,
                status: order.status,
                subtotal: order.subtotal,
                total: order.total,
                item_count: order._count.items,
                payment_status: order.payment?.status ?? null,
                user: order.user,
                created_at: order.created_at,
            })),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async cancelOrderItem(adminId, orderItemId, ipAddress) {
        const result = await this.ordersService.adminCancelOrderItem(orderItemId);
        await this.logAudit({
            userId: adminId,
            action: 'CANCEL_ORDER_ITEM',
            entity: 'OrderItem',
            entityId: orderItemId,
            newValue: { status: 'CANCELLED' },
            ipAddress,
        });
        return result;
    }
    async refundOrderItem(adminId, orderItemId, ipAddress) {
        const result = await this.ordersService.adminRefundOrderItem(orderItemId);
        await this.logAudit({
            userId: adminId,
            action: 'REFUND_ORDER_ITEM',
            entity: 'OrderItem',
            entityId: orderItemId,
            newValue: { status: 'REFUNDED' },
            ipAddress,
        });
        return result;
    }
    async listAuditLogs(query) {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            this.prisma.auditLog.count(),
        ]);
        return {
            data: logs,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async listCoupons() {
        return this.prisma.coupon.findMany({
            orderBy: { created_at: 'desc' },
        });
    }
    async createCoupon(adminId, dto, ipAddress) {
        const code = dto.code.toUpperCase();
        const existing = await this.prisma.coupon.findFirst({
            where: { code },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: 'DUPLICATE_ENTRY',
                message: 'A coupon with this code already exists.',
            });
        }
        if (dto.discount_type === 'percentage' && dto.discount_value > 100) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Percentage discount cannot exceed 100.',
            });
        }
        const coupon = await this.prisma.coupon.create({
            data: {
                code,
                discount_type: dto.discount_type,
                discount_value: dto.discount_value,
                min_order: dto.min_order,
                max_uses: dto.max_uses,
                expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
                is_active: dto.is_active ?? true,
            },
        });
        await this.logAudit({
            userId: adminId,
            action: 'CREATE_COUPON',
            entity: 'Coupon',
            entityId: coupon.id,
            newValue: { code: coupon.code, discount_type: coupon.discount_type },
            ipAddress,
        });
        return coupon;
    }
    async updateCoupon(adminId, couponId, dto, ipAddress) {
        const coupon = await this.prisma.coupon.findFirst({
            where: { id: couponId },
        });
        if (!coupon) {
            throw new common_1.NotFoundException({
                code: 'COUPON_NOT_FOUND',
                message: 'Coupon not found.',
            });
        }
        if (dto.code) {
            const code = dto.code.toUpperCase();
            const duplicate = await this.prisma.coupon.findFirst({
                where: { code, NOT: { id: couponId } },
            });
            if (duplicate) {
                throw new common_1.ConflictException({
                    code: 'DUPLICATE_ENTRY',
                    message: 'A coupon with this code already exists.',
                });
            }
        }
        if (dto.discount_type === 'percentage' &&
            dto.discount_value !== undefined &&
            dto.discount_value > 100) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Percentage discount cannot exceed 100.',
            });
        }
        const updated = await this.prisma.coupon.update({
            where: { id: couponId },
            data: {
                ...(dto.code !== undefined && { code: dto.code.toUpperCase() }),
                ...(dto.discount_type !== undefined && {
                    discount_type: dto.discount_type,
                }),
                ...(dto.discount_value !== undefined && {
                    discount_value: dto.discount_value,
                }),
                ...(dto.min_order !== undefined && { min_order: dto.min_order }),
                ...(dto.max_uses !== undefined && { max_uses: dto.max_uses }),
                ...(dto.expires_at !== undefined && {
                    expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
                }),
                ...(dto.is_active !== undefined && { is_active: dto.is_active }),
            },
        });
        await this.logAudit({
            userId: adminId,
            action: 'UPDATE_COUPON',
            entity: 'Coupon',
            entityId: couponId,
            oldValue: { code: coupon.code, is_active: coupon.is_active },
            newValue: { code: updated.code, is_active: updated.is_active },
            ipAddress,
        });
        return updated;
    }
    async deleteCoupon(adminId, couponId, ipAddress) {
        const coupon = await this.prisma.coupon.findFirst({
            where: { id: couponId },
        });
        if (!coupon) {
            throw new common_1.NotFoundException({
                code: 'COUPON_NOT_FOUND',
                message: 'Coupon not found.',
            });
        }
        await this.prisma.coupon.delete({ where: { id: couponId } });
        await this.logAudit({
            userId: adminId,
            action: 'DELETE_COUPON',
            entity: 'Coupon',
            entityId: couponId,
            oldValue: { code: coupon.code },
            ipAddress,
        });
        return { message: 'Coupon deleted successfully.' };
    }
    async findVendor(vendorId) {
        const vendor = await this.prisma.vendor.findFirst({
            where: { id: vendorId, deleted_at: null },
        });
        if (!vendor) {
            throw new common_1.NotFoundException({
                code: 'VENDOR_NOT_FOUND',
                message: 'Vendor not found.',
            });
        }
        return vendor;
    }
    async logAudit(data) {
        await this.prisma.auditLog.create({
            data: {
                user_id: data.userId,
                action: data.action,
                entity: data.entity,
                entity_id: data.entityId,
                old_value: data.oldValue,
                new_value: data.newValue,
                ip_address: data.ipAddress,
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService,
        orders_service_1.OrdersService])
], AdminService);
//# sourceMappingURL=admin.service.js.map