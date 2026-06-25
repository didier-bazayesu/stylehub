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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const PURCHASED_ORDER_STATUSES = [
    client_1.OrderStatus.CONFIRMED,
    client_1.OrderStatus.PROCESSING,
    client_1.OrderStatus.SHIPPED,
    client_1.OrderStatus.DELIVERED,
];
let ReviewsService = class ReviewsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async findByProduct(productId, query) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, deleted_at: null },
        });
        if (!product) {
            throw new common_1.NotFoundException({
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found.',
            });
        }
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = { product_id: productId, deleted_at: null };
        const [reviews, total] = await Promise.all([
            this.prisma.review.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    user: {
                        select: {
                            first_name: true,
                            last_name: true,
                            avatar_url: true,
                        },
                    },
                },
            }),
            this.prisma.review.count({ where }),
        ]);
        return {
            data: reviews.map((review) => this.mapReview(review)),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async create(userId, productId, dto) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, deleted_at: null },
            include: { vendor: { select: { user_id: true } } },
        });
        if (!product) {
            throw new common_1.NotFoundException({
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found.',
            });
        }
        const existing = await this.prisma.review.findFirst({
            where: { user_id: userId, product_id: productId, deleted_at: null },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: 'ALREADY_REVIEWED',
                message: 'You have already reviewed this product.',
            });
        }
        const hasPurchased = await this.hasVerifiedPurchase(userId, productId);
        if (!hasPurchased) {
            throw new common_1.ForbiddenException({
                code: 'PURCHASE_REQUIRED',
                message: 'You can only review products you have purchased.',
            });
        }
        const review = await this.prisma.review.create({
            data: {
                user_id: userId,
                product_id: productId,
                rating: dto.rating,
                comment: dto.comment,
                is_verified_purchase: true,
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        avatar_url: true,
                    },
                },
            },
        });
        await this.syncProductRating(productId);
        await this.notificationsService.create({
            user_id: product.vendor.user_id,
            type: client_1.NotificationType.REVIEW,
            title: 'New product review',
            message: `${review.user?.first_name ?? 'Someone'} left a ${dto.rating}-star review on ${product.name}.`,
            data: {
                product_id: productId,
                review_id: review.id,
                rating: dto.rating,
            },
        });
        return this.mapReview(review);
    }
    async update(userId, reviewId, dto) {
        const review = await this.findOwnedReview(userId, reviewId);
        const updated = await this.prisma.review.update({
            where: { id: review.id },
            data: {
                ...(dto.rating !== undefined && { rating: dto.rating }),
                ...(dto.comment !== undefined && { comment: dto.comment }),
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        avatar_url: true,
                    },
                },
            },
        });
        await this.syncProductRating(review.product_id);
        return this.mapReview(updated);
    }
    async remove(userId, reviewId) {
        const review = await this.findOwnedReview(userId, reviewId);
        await this.prisma.review.update({
            where: { id: review.id },
            data: { deleted_at: new Date() },
        });
        await this.syncProductRating(review.product_id);
        return { message: 'Review deleted successfully.' };
    }
    async hasVerifiedPurchase(userId, productId) {
        const orderItem = await this.prisma.orderItem.findFirst({
            where: {
                product_id: productId,
                order: {
                    user_id: userId,
                    status: { in: PURCHASED_ORDER_STATUSES },
                    payment: { status: client_1.PaymentStatus.COMPLETED },
                },
            },
        });
        return Boolean(orderItem);
    }
    async findOwnedReview(userId, reviewId) {
        const review = await this.prisma.review.findFirst({
            where: { id: reviewId, user_id: userId, deleted_at: null },
        });
        if (!review) {
            throw new common_1.NotFoundException({
                code: 'REVIEW_NOT_FOUND',
                message: 'Review not found.',
            });
        }
        return review;
    }
    async syncProductRating(productId) {
        const aggregate = await this.prisma.review.aggregate({
            where: { product_id: productId, deleted_at: null },
            _avg: { rating: true },
            _count: { rating: true },
        });
        await this.prisma.product.update({
            where: { id: productId },
            data: {
                avg_rating: aggregate._avg.rating ?? 0,
                review_count: aggregate._count.rating,
            },
        });
    }
    mapReview(review) {
        return {
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            is_verified_purchase: review.is_verified_purchase,
            created_at: review.created_at,
            updated_at: review.updated_at,
            user: review.user
                ? {
                    first_name: review.user.first_name,
                    last_name: review.user.last_name,
                    avatar_url: review.user.avatar_url,
                }
                : null,
        };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map