import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { PaginationQueryDto } from '../common/dto';
export declare class ReviewsService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    findByProduct(productId: string, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            rating: number;
            comment: string | null;
            is_verified_purchase: boolean;
            created_at: Date;
            updated_at: Date;
            user: {
                first_name: string;
                last_name: string;
                avatar_url: string | null;
            } | null;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(userId: string, productId: string, dto: CreateReviewDto): Promise<{
        id: string;
        rating: number;
        comment: string | null;
        is_verified_purchase: boolean;
        created_at: Date;
        updated_at: Date;
        user: {
            first_name: string;
            last_name: string;
            avatar_url: string | null;
        } | null;
    }>;
    update(userId: string, reviewId: string, dto: UpdateReviewDto): Promise<{
        id: string;
        rating: number;
        comment: string | null;
        is_verified_purchase: boolean;
        created_at: Date;
        updated_at: Date;
        user: {
            first_name: string;
            last_name: string;
            avatar_url: string | null;
        } | null;
    }>;
    remove(userId: string, reviewId: string): Promise<{
        message: string;
    }>;
    private hasVerifiedPurchase;
    private findOwnedReview;
    private syncProductRating;
    private mapReview;
}
