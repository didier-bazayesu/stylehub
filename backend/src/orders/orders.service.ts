import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { NotificationType, OrderStatus, ProductStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { VendorsService } from '../vendors/vendors.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, UpdateOrderItemStatusDto } from './dto';
import { PaginationQueryDto } from '../common/dto';

const FLAT_SHIPPING_COST = 9.99;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private vendorsService: VendorsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const cart = await this.cartService.getCartWithItems(userId);

    if (!cart || cart.items.length === 0) {
      throw new UnprocessableEntityException({
        code: 'CART_EMPTY',
        message: 'Your cart is empty. Add items before checkout.',
      });
    }

    const address = await this.prisma.address.findFirst({
      where: { id: dto.address_id, user_id: userId },
    });

    if (!address) {
      throw new NotFoundException({
        code: 'ADDRESS_NOT_FOUND',
        message: 'Shipping address not found.',
      });
    }

    for (const item of cart.items) {
      if (
        item.product.deleted_at !== null ||
        item.product.status !== ProductStatus.ACTIVE
      ) {
        throw new UnprocessableEntityException({
          code: 'PRODUCT_UNAVAILABLE',
          message: `${item.product.name} is no longer available.`,
        });
      }

      if (item.quantity > item.variant.stock) {
        throw new UnprocessableEntityException({
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for ${item.product.name}.`,
        });
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0,
    );

    const coupon = dto.coupon_code
      ? await this.validateCoupon(dto.coupon_code, subtotal)
      : null;

    const discount = coupon ? this.calculateDiscount(coupon, subtotal) : 0;
    const shippingCost = FLAT_SHIPPING_COST;
    const total = Math.max(subtotal + shippingCost - discount, 0);

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          user_id: userId,
          address_id: address.id,
          status: OrderStatus.PENDING,
          subtotal,
          shipping_cost: shippingCost,
          discount,
          total,
          coupon_code: coupon?.code,
          notes: dto.notes,
        },
      });

      for (const item of cart.items) {
        const product = await tx.product.findFirstOrThrow({
          where: { id: item.product_id },
          select: { vendor_id: true },
        });

        const unitPrice = item.variant.price;
        const totalPrice = Number(unitPrice) * item.quantity;

        await tx.orderItem.create({
          data: {
            order_id: createdOrder.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            vendor_id: product.vendor_id,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            status: OrderStatus.PENDING,
          },
        });

        await tx.productVariant.update({
          where: { id: item.variant_id },
          data: { stock: { decrement: item.quantity } },
        });

        const stockAggregate = await tx.productVariant.aggregate({
          where: { product_id: item.product_id },
          _sum: { stock: true },
        });

        await tx.product.update({
          where: { id: item.product_id },
          data: { total_stock: stockAggregate._sum.stock ?? 0 },
        });
      }

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { uses_count: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });

      return createdOrder;
    });

    await this.notifyVendorsOfNewOrder(order.id);

    return this.findById(userId, order.id);
  }

  async findAllForUser(userId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = { user_id: userId };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: this.orderSummaryInclude(),
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((order) => this.mapOrderSummary(order)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, user_id: userId },
      include: this.orderDetailInclude(),
    });

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found.',
      });
    }

    return this.mapOrderDetail(order);
  }

  async findAllForVendor(userId: string, query: PaginationQueryDto) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = { vendor_id: vendor.id };

    const [orderItems, total] = await Promise.all([
      this.prisma.orderItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: { created_at: 'desc' } },
        include: {
          order: {
            select: {
              id: true,
              status: true,
              created_at: true,
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
              address: true,
            },
          },
          product: {
            select: { id: true, name: true, slug: true },
          },
          variant: {
            select: { id: true, sku: true, size: true, color: true },
          },
        },
      }),
      this.prisma.orderItem.count({ where }),
    ]);

    return {
      data: orderItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        status: item.status,
        order: item.order,
        product: item.product,
        variant: item.variant,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateOrderItemStatus(
    userId: string,
    orderItemId: string,
    dto: UpdateOrderItemStatusDto,
  ) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);

    const orderItem = await this.prisma.orderItem.findFirst({
      where: { id: orderItemId, vendor_id: vendor.id },
    });

    if (!orderItem) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order item not found.',
      });
    }

    const allowedStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
    ];

    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid order item status.',
      });
    }

    const updated = await this.prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status: dto.status },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        variant: { select: { id: true, sku: true, size: true, color: true } },
        order: { select: { id: true, user_id: true } },
      },
    });

    await this.notificationsService.create({
      user_id: updated.order.user_id,
      type: NotificationType.ORDER_UPDATE,
      title: 'Order status updated',
      message: `Your order item for ${updated.product.name} is now ${dto.status.toLowerCase()}.`,
      data: {
        order_id: updated.order.id,
        order_item_id: updated.id,
        status: dto.status,
      },
    });

    return {
      id: updated.id,
      status: updated.status,
      product: updated.product,
      variant: updated.variant,
      message: 'Order item status updated successfully.',
    };
  }

  private async notifyVendorsOfNewOrder(orderId: string) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { order_id: orderId },
      include: {
        product: { select: { name: true } },
        vendor: { select: { user_id: true } },
      },
    });

    const notifiedVendors = new Set<string>();

    for (const item of orderItems) {
      if (notifiedVendors.has(item.vendor.user_id)) {
        continue;
      }

      notifiedVendors.add(item.vendor.user_id);

      await this.notificationsService.create({
        user_id: item.vendor.user_id,
        type: NotificationType.ORDER_UPDATE,
        title: 'New order received',
        message: `You received a new order including ${item.product.name}.`,
        data: { order_id: orderId },
      });
    }
  }

  private async validateCoupon(code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        is_active: true,
      },
    });

    if (!coupon) {
      throw new UnprocessableEntityException({
        code: 'INVALID_COUPON',
        message: 'Coupon code is invalid or expired.',
      });
    }

    if (coupon.expires_at && coupon.expires_at < new Date()) {
      throw new UnprocessableEntityException({
        code: 'INVALID_COUPON',
        message: 'Coupon code is invalid or expired.',
      });
    }

    if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
      throw new UnprocessableEntityException({
        code: 'INVALID_COUPON',
        message: 'Coupon code has reached its usage limit.',
      });
    }

    if (coupon.min_order && subtotal < Number(coupon.min_order)) {
      throw new UnprocessableEntityException({
        code: 'INVALID_COUPON',
        message: `Minimum order amount of $${coupon.min_order} required for this coupon.`,
      });
    }

    return coupon;
  }

  private calculateDiscount(
    coupon: { discount_type: string; discount_value: Prisma.Decimal },
    subtotal: number,
  ) {
    if (coupon.discount_type === 'percentage') {
      return Math.min(
        subtotal * (Number(coupon.discount_value) / 100),
        subtotal,
      );
    }

    return Math.min(Number(coupon.discount_value), subtotal);
  }

  private orderSummaryInclude() {
    return {
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      },
      payment: {
        select: { status: true },
      },
    };
  }

  private orderDetailInclude() {
    return {
      address: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { is_primary: true },
                take: 1,
                select: { url: true },
              },
            },
          },
          variant: {
            select: { id: true, sku: true, size: true, color: true },
          },
          vendor: {
            select: {
              id: true,
              business_name: true,
              store: { select: { name: true, slug: true } },
            },
          },
        },
      },
      payment: true,
    };
  }

  private mapOrderSummary(
    order: Prisma.OrderGetPayload<{
      include: ReturnType<OrdersService['orderSummaryInclude']>;
    }>,
  ) {
    return {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      shipping_cost: order.shipping_cost,
      discount: order.discount,
      total: order.total,
      item_count: order.items.length,
      payment_status: order.payment?.status ?? null,
      created_at: order.created_at,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        total_price: item.total_price,
        status: item.status,
        product: item.product,
      })),
    };
  }

  private mapOrderDetail(
    order: Prisma.OrderGetPayload<{
      include: ReturnType<OrdersService['orderDetailInclude']>;
    }>,
  ) {
    return {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      shipping_cost: order.shipping_cost,
      discount: order.discount,
      total: order.total,
      coupon_code: order.coupon_code,
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
      address: order.address,
      payment: order.payment,
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        status: item.status,
        product: {
          ...item.product,
          image: item.product.images[0]?.url ?? null,
        },
        variant: item.variant,
        vendor: item.vendor,
      })),
    };
  }
}
