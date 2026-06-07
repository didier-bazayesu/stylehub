import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { PaginationQueryDto } from '../common/dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
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
            };
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
        };
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
        };
    }>;
    remove(userId: string, reviewId: string): Promise<{
        message: string;
    }>;
}
