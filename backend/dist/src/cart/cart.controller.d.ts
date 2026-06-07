import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(userId: string): Promise<{
        id: string;
        items: {
            id: string;
            quantity: number;
            added_at: Date;
            line_total: number;
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                image: string;
            };
        }[];
        subtotal: number;
        item_count: number;
        updated_at: Date;
    }>;
    addItem(userId: string, dto: AddCartItemDto): Promise<{
        id: string;
        items: {
            id: string;
            quantity: number;
            added_at: Date;
            line_total: number;
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                image: string;
            };
        }[];
        subtotal: number;
        item_count: number;
        updated_at: Date;
    }>;
    updateItem(userId: string, variantId: string, dto: UpdateCartItemDto): Promise<{
        id: string;
        items: {
            id: string;
            quantity: number;
            added_at: Date;
            line_total: number;
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                image: string;
            };
        }[];
        subtotal: number;
        item_count: number;
        updated_at: Date;
    }>;
    removeItem(userId: string, variantId: string): Promise<{
        id: string;
        items: {
            id: string;
            quantity: number;
            added_at: Date;
            line_total: number;
            variant: {
                id: string;
                sku: string;
                size: string | null;
                color: string | null;
                price: import("@prisma/client-runtime-utils").Decimal;
                stock: number;
            };
            product: {
                id: string;
                name: string;
                slug: string;
                image: string;
            };
        }[];
        subtotal: number;
        item_count: number;
        updated_at: Date;
    }>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
}
