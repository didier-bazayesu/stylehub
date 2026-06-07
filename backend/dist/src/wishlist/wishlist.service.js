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
exports.WishlistService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let WishlistService = class WishlistService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWishlist(userId) {
        const wishlist = await this.getOrCreateWishlist(userId);
        const items = wishlist.items.map((item) => ({
            id: item.id,
            added_at: item.added_at,
            product: {
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                base_price: item.product.base_price,
                avg_rating: item.product.avg_rating,
                review_count: item.product.review_count,
                image: item.product.images[0]?.url ?? null,
                category: item.product.category,
            },
        }));
        return {
            id: wishlist.id,
            items,
            item_count: items.length,
        };
    }
    async addItem(userId, productId) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                status: client_1.ProductStatus.ACTIVE,
                deleted_at: null,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException({
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found or unavailable.',
            });
        }
        const wishlist = await this.getOrCreateWishlist(userId);
        const existing = await this.prisma.wishlistItem.findFirst({
            where: { wishlist_id: wishlist.id, product_id: productId },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: 'ALREADY_IN_WISHLIST',
                message: 'Product is already in your wishlist.',
            });
        }
        await this.prisma.wishlistItem.create({
            data: {
                wishlist_id: wishlist.id,
                product_id: productId,
            },
        });
        return this.getWishlist(userId);
    }
    async removeItem(userId, productId) {
        const wishlist = await this.getOrCreateWishlist(userId);
        const item = await this.prisma.wishlistItem.findFirst({
            where: { wishlist_id: wishlist.id, product_id: productId },
        });
        if (!item) {
            throw new common_1.NotFoundException({
                code: 'WISHLIST_ITEM_NOT_FOUND',
                message: 'Product not found in wishlist.',
            });
        }
        await this.prisma.wishlistItem.delete({ where: { id: item.id } });
        return this.getWishlist(userId);
    }
    async getOrCreateWishlist(userId) {
        let wishlist = await this.prisma.wishlist.findFirst({
            where: { user_id: userId },
            include: {
                items: {
                    orderBy: { added_at: 'desc' },
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                base_price: true,
                                avg_rating: true,
                                review_count: true,
                                images: {
                                    where: { is_primary: true },
                                    take: 1,
                                    select: { url: true },
                                },
                                category: {
                                    select: { id: true, name: true, slug: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!wishlist) {
            wishlist = await this.prisma.wishlist.create({
                data: { user_id: userId },
                include: {
                    items: {
                        orderBy: { added_at: 'desc' },
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    base_price: true,
                                    avg_rating: true,
                                    review_count: true,
                                    images: {
                                        where: { is_primary: true },
                                        take: 1,
                                        select: { url: true },
                                    },
                                    category: {
                                        select: { id: true, name: true, slug: true },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        }
        return wishlist;
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WishlistService);
//# sourceMappingURL=wishlist.service.js.map