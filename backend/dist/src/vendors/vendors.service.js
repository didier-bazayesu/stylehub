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
exports.VendorsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let VendorsService = class VendorsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async apply(userId, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
            include: { vendor: true },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'User not found.',
            });
        }
        if (user.vendor) {
            throw new common_1.ConflictException({
                code: 'VENDOR_ALREADY_EXISTS',
                message: 'You have already submitted a vendor application.',
            });
        }
        const vendor = await this.prisma.$transaction(async (tx) => {
            const createdVendor = await tx.vendor.create({
                data: {
                    user_id: userId,
                    business_name: dto.business_name,
                    business_email: dto.business_email.toLowerCase(),
                    description: dto.description,
                    status: client_1.VendorStatus.PENDING,
                },
            });
            await tx.user.update({
                where: { id: userId },
                data: { role: client_1.Role.VENDOR },
            });
            return createdVendor;
        });
        await this.notificationsService.notifyAdmins({
            type: client_1.NotificationType.SYSTEM,
            title: 'Vendor application submitted',
            message: `${vendor.business_name} (${vendor.business_email}) submitted a vendor application and is awaiting approval.`,
            data: { vendor_id: vendor.id, user_id: userId },
        });
        return {
            id: vendor.id,
            status: vendor.status,
            business_name: vendor.business_name,
            business_email: vendor.business_email,
            description: vendor.description,
            message: 'Vendor application submitted. Awaiting admin approval.',
        };
    }
    async getMe(userId) {
        const vendor = await this.prisma.vendor.findFirst({
            where: { user_id: userId, deleted_at: null },
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo_url: true,
                        banner_url: true,
                        description: true,
                        is_active: true,
                        created_at: true,
                        updated_at: true,
                    },
                },
            },
        });
        if (!vendor) {
            throw new common_1.NotFoundException({
                code: 'VENDOR_NOT_FOUND',
                message: 'Vendor profile not found.',
            });
        }
        return this.mapVendor(vendor);
    }
    async updateMe(userId, dto) {
        const vendor = await this.findVendorByUserId(userId);
        const updated = await this.prisma.vendor.update({
            where: { id: vendor.id },
            data: {
                ...(dto.business_name !== undefined && {
                    business_name: dto.business_name,
                }),
                ...(dto.business_email !== undefined && {
                    business_email: dto.business_email.toLowerCase(),
                }),
                ...(dto.description !== undefined && { description: dto.description }),
            },
        });
        return this.mapVendor(updated);
    }
    async getStats(userId) {
        const vendor = await this.findVendorByUserId(userId);
        const [productCount, orderItems, revenueAggregate, customerGroups] = await Promise.all([
            this.prisma.product.count({
                where: { vendor_id: vendor.id, deleted_at: null },
            }),
            this.prisma.orderItem.count({
                where: { vendor_id: vendor.id },
            }),
            this.prisma.orderItem.aggregate({
                where: { vendor_id: vendor.id },
                _sum: { total_price: true },
            }),
            this.prisma.orderItem.groupBy({
                by: ['order_id'],
                where: { vendor_id: vendor.id },
            }),
        ]);
        const uniqueOrderIds = new Set(customerGroups.map((item) => item.order_id));
        const orders = await this.prisma.order.findMany({
            where: { id: { in: [...uniqueOrderIds] } },
            select: { user_id: true },
        });
        const uniqueCustomers = new Set(orders.map((order) => order.user_id));
        return {
            total_revenue: revenueAggregate._sum.total_price ?? 0,
            total_orders: orderItems,
            total_products: productCount,
            total_customers: uniqueCustomers.size,
        };
    }
    async getVendorIdForUser(userId) {
        const vendor = await this.findVendorByUserId(userId);
        return vendor.id;
    }
    async requireApprovedVendor(userId) {
        const vendor = await this.findVendorByUserId(userId);
        if (vendor.status !== client_1.VendorStatus.APPROVED) {
            throw new common_1.ForbiddenException({
                code: 'VENDOR_NOT_APPROVED',
                message: 'Your vendor account must be approved before performing this action.',
            });
        }
        return vendor;
    }
    async findVendorByUserId(userId) {
        const vendor = await this.prisma.vendor.findFirst({
            where: { user_id: userId, deleted_at: null },
        });
        if (!vendor) {
            throw new common_1.NotFoundException({
                code: 'VENDOR_NOT_FOUND',
                message: 'Vendor profile not found.',
            });
        }
        return vendor;
    }
    mapVendor(vendor) {
        return {
            id: vendor.id,
            status: vendor.status,
            business_name: vendor.business_name,
            business_email: vendor.business_email,
            description: vendor.description,
            rejection_reason: vendor.rejection_reason,
            created_at: vendor.created_at,
            updated_at: vendor.updated_at,
            store: vendor.store ?? null,
        };
    }
};
exports.VendorsService = VendorsService;
exports.VendorsService = VendorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], VendorsService);
//# sourceMappingURL=vendors.service.js.map