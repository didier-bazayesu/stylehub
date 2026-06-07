import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePaymentIntentDto } from './dto';
export declare class PaymentsService {
    private prisma;
    private configService;
    private notificationsService;
    private readonly logger;
    private readonly stripe;
    constructor(prisma: PrismaService, configService: ConfigService, notificationsService: NotificationsService);
    createPaymentIntent(userId: string, dto: CreatePaymentIntentDto): Promise<{
        client_secret: string;
        payment_intent_id: string;
        amount: number;
        currency: string;
    }>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
}
