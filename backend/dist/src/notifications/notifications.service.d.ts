import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllForUser(userId: string): Promise<{
        items: {
            id: string;
            type: import("@prisma/client").$Enums.NotificationType;
            title: string;
            message: string;
            is_read: boolean;
            data: Prisma.JsonValue;
            created_at: Date;
        }[];
        unread_count: number;
    }>;
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
    create(data: {
        user_id: string;
        type: NotificationType;
        title: string;
        message: string;
        data?: Prisma.InputJsonValue;
    }): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        is_read: boolean;
        data: Prisma.JsonValue;
        created_at: Date;
    }>;
    private findOwnedNotification;
    private mapNotification;
}
