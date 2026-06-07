import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ProductStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    return this.mapCart(cart);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
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

    if (
      !variant ||
      variant.product.deleted_at !== null ||
      variant.product.status !== ProductStatus.ACTIVE
    ) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product variant not found or unavailable.',
      });
    }

    if (dto.quantity > variant.stock) {
      throw new UnprocessableEntityException({
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
        throw new UnprocessableEntityException({
          code: 'INSUFFICIENT_STOCK',
          message: `Only ${variant.stock} items available in stock.`,
        });
      }

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
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

  async updateItem(
    userId: string,
    variantId: string,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, variant_id: variantId },
      include: { variant: true },
    });

    if (!item) {
      throw new NotFoundException({
        code: 'CART_ITEM_NOT_FOUND',
        message: 'Cart item not found.',
      });
    }

    if (dto.quantity > item.variant.stock) {
      throw new UnprocessableEntityException({
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

  async removeItem(userId: string, variantId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = await this.prisma.cartItem.findFirst({
      where: { cart_id: cart.id, variant_id: variantId },
    });

    if (!item) {
      throw new NotFoundException({
        code: 'CART_ITEM_NOT_FOUND',
        message: 'Cart item not found.',
      });
    }

    await this.prisma.cartItem.delete({ where: { id: item.id } });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cart_id: cart.id },
    });

    return { message: 'Cart cleared successfully.' };
  }

  async getCartWithItems(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { user_id: userId },
      include: this.cartInclude(),
    });

    if (!cart) {
      return null;
    }

    return cart;
  }

  private async getOrCreateCart(userId: string) {
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

  private cartInclude() {
    return {
      items: {
        orderBy: { added_at: 'desc' as const },
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

  private mapCart(
    cart: Prisma.CartGetPayload<{
      include: ReturnType<CartService['cartInclude']>;
    }>,
  ) {
    const items = cart.items.map((item) => {
      const lineTotal = Number(item.variant.price) * item.quantity;

      return {
        id: item.id,
        quantity: item.quantity,
        added_at: item.added_at,
        line_total: lineTotal,
        variant: item.variant,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images[0]?.url ?? null,
        },
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      items,
      subtotal,
      item_count: itemCount,
      updated_at: cart.updated_at,
    };
  }
}
