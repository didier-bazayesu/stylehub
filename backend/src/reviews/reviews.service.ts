import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { NotificationType, OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { PaginationQueryDto } from '../common/dto';

const PURCHASED_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
];

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findByProduct(productId: string, query: PaginationQueryDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deleted_at: null },
    });

    if (!product) {
      throw new NotFoundException({
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

  async create(userId: string, productId: string, dto: CreateReviewDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deleted_at: null },
      include: { vendor: { select: { user_id: true } } },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    const existing = await this.prisma.review.findFirst({
      where: { user_id: userId, product_id: productId, deleted_at: null },
    });

    if (existing) {
      throw new ConflictException({
        code: 'ALREADY_REVIEWED',
        message: 'You have already reviewed this product.',
      });
    }

    const hasPurchased = await this.hasVerifiedPurchase(userId, productId);

    if (!hasPurchased) {
      throw new ForbiddenException({
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
      type: NotificationType.REVIEW,
      title: 'New product review',
      message: `${review.user.first_name} left a ${dto.rating}-star review on ${product.name}.`,
      data: {
        product_id: productId,
        review_id: review.id,
        rating: dto.rating,
      },
    });

    return this.mapReview(review);
  }

  async update(userId: string, reviewId: string, dto: UpdateReviewDto) {
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

  async remove(userId: string, reviewId: string) {
    const review = await this.findOwnedReview(userId, reviewId);

    await this.prisma.review.update({
      where: { id: review.id },
      data: { deleted_at: new Date() },
    });

    await this.syncProductRating(review.product_id);

    return { message: 'Review deleted successfully.' };
  }

  private async hasVerifiedPurchase(userId: string, productId: string) {
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        product_id: productId,
        order: {
          user_id: userId,
          status: { in: PURCHASED_ORDER_STATUSES },
          payment: { status: PaymentStatus.COMPLETED },
        },
      },
    });

    return Boolean(orderItem);
  }

  private async findOwnedReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findFirst({
      where: { id: reviewId, user_id: userId, deleted_at: null },
    });

    if (!review) {
      throw new NotFoundException({
        code: 'REVIEW_NOT_FOUND',
        message: 'Review not found.',
      });
    }

    return review;
  }

  private async syncProductRating(productId: string) {
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

  private mapReview(review: {
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
  }) {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      is_verified_purchase: review.is_verified_purchase,
      created_at: review.created_at,
      updated_at: review.updated_at,
      user: {
        first_name: review.user.first_name,
        last_name: review.user.last_name,
        avatar_url: review.user.avatar_url,
      },
    };
  }
}
