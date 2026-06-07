import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto';
export declare class WishlistController {
    private readonly wishlistService;
    constructor(wishlistService: WishlistService);
    getWishlist(userId: string): Promise<{
        id: string;
        items: {
            id: string;
            added_at: Date;
            product: {
                id: string;
                name: string;
                slug: string;
                base_price: import("@prisma/client-runtime-utils").Decimal;
                avg_rating: number;
                review_count: number;
                image: string;
                category: {
                    id: string;
                    name: string;
                    slug: string;
                };
            };
        }[];
        item_count: number;
    }>;
    addItem(userId: string, dto: AddWishlistItemDto): Promise<{
        id: string;
        items: {
            id: string;
            added_at: Date;
            product: {
                id: string;
                name: string;
                slug: string;
                base_price: import("@prisma/client-runtime-utils").Decimal;
                avg_rating: number;
                review_count: number;
                image: string;
                category: {
                    id: string;
                    name: string;
                    slug: string;
                };
            };
        }[];
        item_count: number;
    }>;
    removeItem(userId: string, productId: string): Promise<{
        id: string;
        items: {
            id: string;
            added_at: Date;
            product: {
                id: string;
                name: string;
                slug: string;
                base_price: import("@prisma/client-runtime-utils").Decimal;
                avg_rating: number;
                review_count: number;
                image: string;
                category: {
                    id: string;
                    name: string;
                    slug: string;
                };
            };
        }[];
        item_count: number;
    }>;
}
