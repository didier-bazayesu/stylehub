import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
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
}
