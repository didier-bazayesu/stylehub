import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationType, OrderStatus, PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePaymentIntentDto } from './dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
  }

  async createPaymentIntent(userId: string, dto: CreatePaymentIntentDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.order_id, user_id: userId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found.',
      });
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new UnprocessableEntityException({
        code: 'ORDER_CANCELLED',
        message: 'This order has been cancelled.',
      });
    }

    if (order.payment?.status === PaymentStatus.COMPLETED) {
      throw new UnprocessableEntityException({
        code: 'ORDER_ALREADY_PAID',
        message: 'This order has already been paid.',
      });
    }

    if (
      order.stripe_payment_intent_id &&
      order.payment?.status === PaymentStatus.PENDING
    ) {
      const existingIntent = await this.stripe.paymentIntents.retrieve(
        order.stripe_payment_intent_id,
      );

      if (
        existingIntent.status !== 'canceled' &&
        existingIntent.client_secret
      ) {
        return {
          client_secret: existingIntent.client_secret,
          payment_intent_id: existingIntent.id,
          amount: Number(order.total),
          currency: 'usd',
        };
      }
    }

    const amountInCents = Math.round(Number(order.total) * 100);

    if (amountInCents < 50) {
      throw new UnprocessableEntityException({
        code: 'PAYMENT_FAILED',
        message: 'Order total is below the minimum charge amount.',
      });
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        order_id: order.id,
        user_id: userId,
      },
      automatic_payment_methods: { enabled: true },
    });

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: order.id },
        data: { stripe_payment_intent_id: paymentIntent.id },
      }),
      this.prisma.payment.upsert({
        where: { order_id: order.id },
        create: {
          order_id: order.id,
          stripe_payment_intent: paymentIntent.id,
          amount: order.total,
          currency: 'usd',
          status: PaymentStatus.PENDING,
        },
        update: {
          stripe_payment_intent: paymentIntent.id,
          status: PaymentStatus.PENDING,
          paid_at: null,
        },
      }),
    ]);

    if (!paymentIntent.client_secret) {
      throw new UnprocessableEntityException({
        code: 'PAYMENT_FAILED',
        message: 'Failed to create payment intent.',
      });
    }

    return {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      amount: Number(order.total),
      currency: 'usd',
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!signature) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Missing Stripe signature header.',
      });
    }

    const webhookSecret = this.configService.getOrThrow<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error('Stripe webhook signature verification failed', error);
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid Stripe webhook signature.',
      });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: {
    id: string;
    metadata: { order_id?: string };
  }) {
    const orderId = paymentIntent.metadata.order_id;

    if (!orderId) {
      this.logger.warn(
        `PaymentIntent ${paymentIntent.id} missing order_id metadata`,
      );
      return;
    }

    const payment = await this.prisma.payment.findFirst({
      where: { order_id: orderId },
      include: { order: { select: { id: true, user_id: true, total: true } } },
    });

    if (!payment) {
      this.logger.warn(`No payment record found for order ${orderId}`);
      return;
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { order_id: orderId },
        data: {
          status: PaymentStatus.COMPLETED,
          paid_at: new Date(),
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CONFIRMED },
      }),
      this.prisma.orderItem.updateMany({
        where: { order_id: orderId },
        data: { status: OrderStatus.CONFIRMED },
      }),
    ]);

    const orderRef = `#${orderId.slice(-8).toUpperCase()}`;

    await this.notificationsService.notifyCustomer(payment.order.user_id, {
      type: NotificationType.ORDER_UPDATE,
      title: 'Payment confirmed',
      message: `Payment of $${payment.order.total} received for order ${orderRef}. Your order is confirmed.`,
      data: { order_id: orderId },
    });

    const orderItems = await this.prisma.orderItem.findMany({
      where: { order_id: orderId },
      include: {
        vendor: { select: { user_id: true } },
        product: { select: { name: true } },
      },
    });

    const notifiedVendors = new Set<string>();
    for (const item of orderItems) {
      if (notifiedVendors.has(item.vendor.user_id)) continue;
      notifiedVendors.add(item.vendor.user_id);

      await this.notificationsService.notifyVendor(item.vendor.user_id, {
        type: NotificationType.ORDER_UPDATE,
        title: 'Payment confirmed',
        message: `Payment confirmed for order ${orderRef}. You can start processing.`,
        data: { order_id: orderId },
      });
    }
  }

  private async handlePaymentFailed(paymentIntent: {
    id: string;
    metadata: { order_id?: string };
  }) {
    const orderId = paymentIntent.metadata.order_id;

    if (!orderId) {
      this.logger.warn(
        `PaymentIntent ${paymentIntent.id} missing order_id metadata`,
      );
      return;
    }

    const payment = await this.prisma.payment.findFirst({
      where: { order_id: orderId },
    });

    if (!payment || payment.status === PaymentStatus.COMPLETED) {
      return;
    }

    await this.prisma.payment.update({
      where: { order_id: orderId },
      data: { status: PaymentStatus.FAILED },
    });
  }
}
