"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const stripe_1 = __importDefault(require("stripe"));
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    configService;
    notificationsService;
    logger = new common_1.Logger(PaymentsService_1.name);
    stripe;
    constructor(prisma, configService, notificationsService) {
        this.prisma = prisma;
        this.configService = configService;
        this.notificationsService = notificationsService;
        this.stripe = new stripe_1.default(this.configService.getOrThrow('STRIPE_SECRET_KEY'));
    }
    async createPaymentIntent(userId, dto) {
        const order = await this.prisma.order.findFirst({
            where: { id: dto.order_id, user_id: userId },
            include: { payment: true },
        });
        if (!order) {
            throw new common_1.NotFoundException({
                code: 'ORDER_NOT_FOUND',
                message: 'Order not found.',
            });
        }
        if (order.status === client_1.OrderStatus.CANCELLED) {
            throw new common_1.UnprocessableEntityException({
                code: 'ORDER_CANCELLED',
                message: 'This order has been cancelled.',
            });
        }
        if (order.payment?.status === client_1.PaymentStatus.COMPLETED) {
            throw new common_1.UnprocessableEntityException({
                code: 'ORDER_ALREADY_PAID',
                message: 'This order has already been paid.',
            });
        }
        if (order.stripe_payment_intent_id &&
            order.payment?.status === client_1.PaymentStatus.PENDING) {
            const existingIntent = await this.stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
            if (existingIntent.status !== 'canceled' &&
                existingIntent.client_secret) {
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
            throw new common_1.UnprocessableEntityException({
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
                    status: client_1.PaymentStatus.PENDING,
                },
                update: {
                    stripe_payment_intent: paymentIntent.id,
                    status: client_1.PaymentStatus.PENDING,
                    paid_at: null,
                },
            }),
        ]);
        if (!paymentIntent.client_secret) {
            throw new common_1.UnprocessableEntityException({
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
    async handleWebhook(rawBody, signature) {
        if (!signature) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Missing Stripe signature header.',
            });
        }
        const webhookSecret = this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET');
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch (error) {
            this.logger.error('Stripe webhook signature verification failed', error);
            throw new common_1.BadRequestException({
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
    async handlePaymentSucceeded(paymentIntent) {
        const orderId = paymentIntent.metadata.order_id;
        if (!orderId) {
            this.logger.warn(`PaymentIntent ${paymentIntent.id} missing order_id metadata`);
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
        if (payment.status === client_1.PaymentStatus.COMPLETED) {
            return;
        }
        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { order_id: orderId },
                data: {
                    status: client_1.PaymentStatus.COMPLETED,
                    paid_at: new Date(),
                },
            }),
            this.prisma.order.update({
                where: { id: orderId },
                data: { status: client_1.OrderStatus.CONFIRMED },
            }),
            this.prisma.orderItem.updateMany({
                where: { order_id: orderId },
                data: { status: client_1.OrderStatus.CONFIRMED },
            }),
        ]);
        const orderRef = `#${orderId.slice(-8).toUpperCase()}`;
        await this.notificationsService.notifyCustomer(payment.order.user_id, {
            type: client_1.NotificationType.ORDER_UPDATE,
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
        const notifiedVendors = new Set();
        for (const item of orderItems) {
            if (notifiedVendors.has(item.vendor.user_id))
                continue;
            notifiedVendors.add(item.vendor.user_id);
            await this.notificationsService.notifyVendor(item.vendor.user_id, {
                type: client_1.NotificationType.ORDER_UPDATE,
                title: 'Payment confirmed',
                message: `Payment confirmed for order ${orderRef}. You can start processing.`,
                data: { order_id: orderId },
            });
        }
    }
    async handlePaymentFailed(paymentIntent) {
        const orderId = paymentIntent.metadata.order_id;
        if (!orderId) {
            this.logger.warn(`PaymentIntent ${paymentIntent.id} missing order_id metadata`);
            return;
        }
        const payment = await this.prisma.payment.findFirst({
            where: { order_id: orderId },
        });
        if (!payment || payment.status === client_1.PaymentStatus.COMPLETED) {
            return;
        }
        await this.prisma.payment.update({
            where: { order_id: orderId },
            data: { status: client_1.PaymentStatus.FAILED },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map