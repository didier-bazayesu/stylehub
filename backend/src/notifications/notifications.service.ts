import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return notifications.map((notification) =>
      this.mapNotification(notification),
    );
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.findOwnedNotification(
      userId,
      notificationId,
    );

    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: { is_read: true },
    });

    return this.mapNotification(updated);
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    return { message: 'All notifications marked as read.' };
  }

  async remove(userId: string, notificationId: string) {
    const notification = await this.findOwnedNotification(
      userId,
      notificationId,
    );

    await this.prisma.notification.delete({
      where: { id: notification.id },
    });

    return { message: 'Notification deleted successfully.' };
  }

  async create(data: {
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Prisma.InputJsonValue;
  }) {
    const notification = await this.prisma.notification.create({ data });
    return this.mapNotification(notification);
  }

  private async findOwnedNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      throw new NotFoundException({
        code: 'NOTIFICATION_NOT_FOUND',
        message: 'Notification not found.',
      });
    }

    return notification;
  }

  private mapNotification(notification: {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    data: Prisma.JsonValue;
    created_at: Date;
  }) {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      is_read: notification.is_read,
      data: notification.data,
      created_at: notification.created_at,
    };
  }
}
