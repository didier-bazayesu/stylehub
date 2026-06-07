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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllForUser(userId) {
        const notifications = await this.prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
        const unreadCount = notifications.filter((n) => !n.is_read).length;
        return {
            items: notifications.map((notification) => this.mapNotification(notification)),
            unread_count: unreadCount,
        };
    }
    async markAsRead(userId, notificationId) {
        const notification = await this.findOwnedNotification(userId, notificationId);
        const updated = await this.prisma.notification.update({
            where: { id: notification.id },
            data: { is_read: true },
        });
        return this.mapNotification(updated);
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true },
        });
        return { message: 'All notifications marked as read.' };
    }
    async remove(userId, notificationId) {
        const notification = await this.findOwnedNotification(userId, notificationId);
        await this.prisma.notification.delete({
            where: { id: notification.id },
        });
        return { message: 'Notification deleted successfully.' };
    }
    async create(data) {
        const notification = await this.prisma.notification.create({ data });
        return this.mapNotification(notification);
    }
    async findOwnedNotification(userId, notificationId) {
        const notification = await this.prisma.notification.findFirst({
            where: { id: notificationId, user_id: userId },
        });
        if (!notification) {
            throw new common_1.NotFoundException({
                code: 'NOTIFICATION_NOT_FOUND',
                message: 'Notification not found.',
            });
        }
        return notification;
    }
    mapNotification(notification) {
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map