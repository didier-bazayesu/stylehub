import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(userId: string): Promise<{
        data: {
            id: string;
            type: import("@prisma/client").$Enums.NotificationType;
            title: string;
            message: string;
            is_read: boolean;
            data: import("@prisma/client/runtime/client").JsonValue;
            created_at: Date;
        }[];
        meta: {
            unread_count: number;
        };
    }>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        is_read: boolean;
        data: import("@prisma/client/runtime/client").JsonValue;
        created_at: Date;
    }>;
    remove(userId: string, notificationId: string): Promise<{
        message: string;
    }>;
}
