import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<{
        id: string;
        user_id: string;
        items: {
            id: string;
            cart_id: string;
            variant_id: string;
            product_id: string;
            quantity: number;
            added_at: Date;
            line_total: number;
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
                price: number;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                images: {
                    url: string;
                    is_primary: boolean;
                }[];
            };
        }[];
        subtotal: number;
        item_count: number;
        updated_at: Date;
    }>;
    addItem(userId: string, dto: AddCartItemDto): Promise<{
        id: string;
        user_id: string;
        items: {
            id: string;
            cart_id: string;
            variant_id: string;
            product_id: string;
            quantity: number;
            added_at: Date;
            line_total: number;
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
                price: number;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                images: {
                    url: string;
                    is_primary: boolean;
                }[];
            };
        }[];
        subtotal: number;
        item_count: number;
        updated_at: Date;
    }>;
    updateItem(userId: string, variantId: string, dto: UpdateCartItemDto): Promise<{
        id: string;
        user_id: string;
        items: {
            id: string;
            cart_id: string;
            variant_id: string;
            product_id: string;
            quantity: number;
            added_at: Date;
            line_total: number;
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
                price: number;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                images: {
                    url: string;
                    is_primary: boolean;
                }[];
            };
        }[];
        subtotal: number;
        item_count: number;
        updated_at: Date;
    }>;
    removeItem(userId: string, variantId: string): Promise<{
        id: string;
        user_id: string;
        items: {
            id: string;
            cart_id: string;
            variant_id: string;
            product_id: string;
            quantity: number;
            added_at: Date;
            line_total: number;
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
                price: number;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                images: {
                    url: string;
                    is_primary: boolean;
                }[];
            };
        }[];
        subtotal: number;
        item_count: number;
        updated_at: Date;
    }>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
    getCartWithItems(userId: string): Promise<({
        items: ({
            product: {
                id: string;
                name: string;
                slug: string;
                deleted_at: Date | null;
                status: import("@prisma/client").$Enums.ProductStatus;
                images: {
                    url: string;
                    is_primary: boolean;
                }[];
            };
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
                price: Prisma.Decimal;
                stock: number;
            };
        } & {
            id: string;
            product_id: string;
            variant_id: string;
            quantity: number;
            cart_id: string;
            added_at: Date;
        })[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
    }) | null>;
    private getOrCreateCart;
    private cartInclude;
    private mapCart;
}
