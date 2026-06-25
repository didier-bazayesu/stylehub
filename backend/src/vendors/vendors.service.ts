import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { NotificationType, Role, VendorStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ApplyVendorDto, UpdateVendorDto } from './dto';

@Injectable()
export class VendorsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async apply(userId: string, dto: ApplyVendorDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: { vendor: true },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    if (user.vendor) {
      throw new ConflictException({
        code: 'VENDOR_ALREADY_EXISTS',
        message: 'You have already submitted a vendor application.',
      });
    }

    const vendor = await this.prisma.$transaction(async (tx) => {
      const createdVendor = await tx.vendor.create({
        data: {
          user_id: userId,
          business_name: dto.business_name,
          business_email: dto.business_email.toLowerCase(),
          description: dto.description,
          status: VendorStatus.PENDING,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { role: Role.VENDOR },
      });

      return createdVendor;
    });

    await this.notificationsService.notifyAdmins({
      type: NotificationType.SYSTEM,
      title: 'Vendor application submitted',
      message: `${vendor.business_name} (${vendor.business_email}) submitted a vendor application and is awaiting approval.`,
      data: { vendor_id: vendor.id, user_id: userId },
    });

    return {
      id: vendor.id,
      status: vendor.status,
      business_name: vendor.business_name,
      business_email: vendor.business_email,
      description: vendor.description,
      message: 'Vendor application submitted. Awaiting admin approval.',
    };
  }

  async getMe(userId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { user_id: userId, deleted_at: null },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo_url: true,
            banner_url: true,
            description: true,
            is_active: true,
            created_at: true,
            updated_at: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        message: 'Vendor profile not found.',
      });
    }

    return this.mapVendor(vendor);
  }

  async updateMe(userId: string, dto: UpdateVendorDto) {
    const vendor = await this.findVendorByUserId(userId);

    const updated = await this.prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        ...(dto.business_name !== undefined && {
          business_name: dto.business_name,
        }),
        ...(dto.business_email !== undefined && {
          business_email: dto.business_email.toLowerCase(),
        }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    return this.mapVendor(updated);
  }

  async getStats(userId: string) {
    const vendor = await this.findVendorByUserId(userId);

    const [productCount, orderItems, revenueAggregate, customerGroups] =
      await Promise.all([
        this.prisma.product.count({
          where: { vendor_id: vendor.id, deleted_at: null },
        }),
        this.prisma.orderItem.count({
          where: { vendor_id: vendor.id },
        }),
        this.prisma.orderItem.aggregate({
          where: { vendor_id: vendor.id },
          _sum: { total_price: true },
        }),
        this.prisma.orderItem.groupBy({
          by: ['order_id'],
          where: { vendor_id: vendor.id },
        }),
      ]);

    const uniqueOrderIds = new Set(customerGroups.map((item) => item.order_id));
    const orders = await this.prisma.order.findMany({
      where: { id: { in: [...uniqueOrderIds] } },
      select: { user_id: true },
    });

    const uniqueCustomers = new Set(orders.map((order) => order.user_id));

    return {
      total_revenue: revenueAggregate._sum.total_price ?? 0,
      total_orders: orderItems,
      total_products: productCount,
      total_customers: uniqueCustomers.size,
    };
  }

  async getVendorIdForUser(userId: string): Promise<string> {
    const vendor = await this.findVendorByUserId(userId);
    return vendor.id;
  }

  async requireApprovedVendor(userId: string) {
    const vendor = await this.findVendorByUserId(userId);

    if (vendor.status !== VendorStatus.APPROVED) {
      throw new ForbiddenException({
        code: 'VENDOR_NOT_APPROVED',
        message: 'Your vendor account must be approved before performing this action.',
      });
    }

    return vendor;
  }

  private async findVendorByUserId(userId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { user_id: userId, deleted_at: null },
    });

    if (!vendor) {
      throw new NotFoundException({
        code: 'VENDOR_NOT_FOUND',
        message: 'Vendor profile not found.',
      });
    }

    return vendor;
  }

  private mapVendor(vendor: {
    id: string;
    status: VendorStatus;
    business_name: string;
    business_email: string;
    description: string | null;
    rejection_reason: string | null;
    created_at: Date;
    updated_at: Date;
    store?: {
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
      banner_url: string | null;
      description: string | null;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
    } | null;
  }) {
    return {
      id: vendor.id,
      status: vendor.status,
      business_name: vendor.business_name,
      business_email: vendor.business_email,
      description: vendor.description,
      rejection_reason: vendor.rejection_reason,
      created_at: vendor.created_at,
      updated_at: vendor.updated_at,
      store: vendor.store ?? null,
    };
  }
}
