import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
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

  async addItem(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        status: ProductStatus.ACTIVE,
        deleted_at: null,
      },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found or unavailable.',
      });
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const existing = await this.prisma.wishlistItem.findFirst({
      where: { wishlist_id: wishlist.id, product_id: productId },
    });

    if (existing) {
      throw new ConflictException({
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

  async removeItem(userId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const item = await this.prisma.wishlistItem.findFirst({
      where: { wishlist_id: wishlist.id, product_id: productId },
    });

    if (!item) {
      throw new NotFoundException({
        code: 'WISHLIST_ITEM_NOT_FOUND',
        message: 'Product not found in wishlist.',
      });
    }

    await this.prisma.wishlistItem.delete({ where: { id: item.id } });

    return this.getWishlist(userId);
  }

  private async getOrCreateWishlist(userId: string) {
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
}
