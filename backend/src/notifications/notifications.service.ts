import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type NotificationPayload = {
  type: NotificationType;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

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

  async create(data: NotificationPayload & { user_id: string }) {
    const notification = await this.prisma.notification.create({ data });
    return this.mapNotification(notification);
  }

  /** Notify a single customer. Failures are logged, never thrown. */
  async notifyCustomer(userId: string, data: NotificationPayload) {
    await this.safeNotify(async () => {
      await this.create({ user_id: userId, ...data });
    });
  }

  /** Notify a single vendor (by their user_id). Failures are logged, never thrown. */
  async notifyVendor(vendorUserId: string, data: NotificationPayload) {
    await this.safeNotify(async () => {
      await this.create({ user_id: vendorUserId, ...data });
    });
  }

  /** Notify every active admin / super-admin. Failures are logged, never thrown. */
  async notifyAdmins(data: NotificationPayload) {
    await this.safeNotify(async () => {
      const admins = await this.prisma.user.findMany({
        where: {
          role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
          is_active: true,
          deleted_at: null,
        },
        select: { id: true },
      });

      if (admins.length === 0) {
        return;
      }

      await this.prisma.notification.createMany({
        data: admins.map((admin) => ({
          user_id: admin.id,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data,
        })),
      });
    });
  }

  /**
   * Runs notification side-effects without breaking the caller's primary action.
   */
  async safeNotify(action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      this.logger.error('Notification delivery failed', error);
    }
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
