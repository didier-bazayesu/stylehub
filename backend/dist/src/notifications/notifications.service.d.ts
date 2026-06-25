import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export type NotificationPayload = {
    type: NotificationType;
    title: string;
    message: string;
    data?: Prisma.InputJsonValue;
};
export declare class NotificationsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAllForUser(userId: string): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        is_read: boolean;
        data: Prisma.JsonValue;
        created_at: Date;
    }[]>;
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        is_read: boolean;
        data: Prisma.JsonValue;
        created_at: Date;
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    remove(userId: string, notificationId: string): Promise<{
        message: string;
    }>;
    create(data: NotificationPayload & {
        user_id: string;
    }): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        is_read: boolean;
        data: Prisma.JsonValue;
        created_at: Date;
    }>;
    notifyCustomer(userId: string, data: NotificationPayload): Promise<void>;
    notifyVendor(vendorUserId: string, data: NotificationPayload): Promise<void>;
    notifyAdmins(data: NotificationPayload): Promise<void>;
    safeNotify(action: () => Promise<void>): Promise<void>;
    private findOwnedNotification;
    private mapNotification;
}
