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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
        const cart = await this.getOrCreateCart(userId);
        return this.mapCart(cart);
    }
    async addItem(userId, dto) {
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: dto.variant_id },
            include: {
                product: {
                    select: {
                        id: true,
                        status: true,
                        deleted_at: true,
                    },
                },
            },
        });
        if (!variant ||
            variant.product.deleted_at !== null ||
            variant.product.status !== client_1.ProductStatus.ACTIVE) {
            throw new common_1.NotFoundException({
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product variant not found or unavailable.',
            });
        }
        if (dto.quantity > variant.stock) {
            throw new common_1.UnprocessableEntityException({
                code: 'INSUFFICIENT_STOCK',
                message: `Only ${variant.stock} items available in stock.`,
            });
        }
        const cart = await this.getOrCreateCart(userId);
        const existingItem = await this.prisma.cartItem.findFirst({
            where: { cart_id: cart.id, variant_id: dto.variant_id },
        });
        if (existingItem) {
            const newQuantity = existingItem.quantity + dto.quantity;
            if (newQuantity > variant.stock) {
                throw new common_1.UnprocessableEntityException({
                    code: 'INSUFFICIENT_STOCK',
                    message: `Only ${variant.stock} items available in stock.`,
                });
            }
            await this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        }
        else {
            await this.prisma.cartItem.create({
                data: {
                    cart_id: cart.id,
                    product_id: variant.product_id,
                    variant_id: variant.id,
                    quantity: dto.quantity,
                },
            });
        }
        await this.prisma.cart.update({
            where: { id: cart.id },
            data: { updated_at: new Date() },
        });
        return this.getCart(userId);
    }
    async updateItem(userId, variantId, dto) {
        const cart = await this.getOrCreateCart(userId);
        const item = await this.prisma.cartItem.findFirst({
            where: { cart_id: cart.id, variant_id: variantId },
            include: { variant: true },
        });
        if (!item) {
            throw new common_1.NotFoundException({
                code: 'CART_ITEM_NOT_FOUND',
                message: 'Cart item not found.',
            });
        }
        if (dto.quantity > item.variant.stock) {
            throw new common_1.UnprocessableEntityException({
                code: 'INSUFFICIENT_STOCK',
                message: `Only ${item.variant.stock} items available in stock.`,
            });
        }
        await this.prisma.cartItem.update({
            where: { id: item.id },
            data: { quantity: dto.quantity },
        });
        return this.getCart(userId);
    }
    async removeItem(userId, variantId) {
        const cart = await this.getOrCreateCart(userId);
        const item = await this.prisma.cartItem.findFirst({
            where: { cart_id: cart.id, variant_id: variantId },
        });
        if (!item) {
            throw new common_1.NotFoundException({
                code: 'CART_ITEM_NOT_FOUND',
                message: 'Cart item not found.',
            });
        }
        await this.prisma.cartItem.delete({ where: { id: item.id } });
        return this.getCart(userId);
    }
    async clearCart(userId) {
        const cart = await this.getOrCreateCart(userId);
        await this.prisma.cartItem.deleteMany({
            where: { cart_id: cart.id },
        });
        return { message: 'Cart cleared successfully.' };
    }
    async getCartWithItems(userId) {
        const cart = await this.prisma.cart.findFirst({
            where: { user_id: userId },
            include: this.cartInclude(),
        });
        if (!cart) {
            return null;
        }
        return cart;
    }
    async getOrCreateCart(userId) {
        let cart = await this.prisma.cart.findFirst({
            where: { user_id: userId },
            include: this.cartInclude(),
        });
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { user_id: userId },
                include: this.cartInclude(),
            });
        }
        return cart;
    }
    cartInclude() {
        return {
            items: {
                orderBy: { added_at: 'desc' },
                include: {
                    variant: {
                        select: {
                            id: true,
                            sku: true,
                            size: true,
                            color: true,
                            price: true,
                            stock: true,
                        },
                    },
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            status: true,
                            deleted_at: true,
                            images: {
                                where: { is_primary: true },
                                take: 1,
                                select: { url: true, is_primary: true },
                            },
                        },
                    },
                },
            },
        };
    }
    mapCart(cart) {
        const items = cart.items.map((item) => {
            const lineTotal = Number(item.variant.price) * item.quantity;
            return {
                id: item.id,
                cart_id: cart.id,
                variant_id: item.variant_id,
                product_id: item.product_id,
                quantity: item.quantity,
                added_at: item.added_at,
                line_total: lineTotal,
                variant: {
                    id: item.variant.id,
                    sku: item.variant.sku,
                    size: item.variant.size,
                    color: item.variant.color,
                    price: Number(item.variant.price),
                    stock: item.variant.stock,
                },
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    slug: item.product.slug,
                    images: item.product.images,
                },
            };
        });
        const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        return {
            id: cart.id,
            user_id: cart.user_id,
            items,
            subtotal,
            item_count: itemCount,
            updated_at: cart.updated_at,
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map