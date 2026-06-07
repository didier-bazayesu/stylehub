import { PrismaService } from '../prisma/prisma.service';
export declare class WishlistService {
    private prisma;
    constructor(prisma: PrismaService);
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
    addItem(userId: string, productId: string): Promise<{
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
    private getOrCreateWishlist;
}
