import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: { vendor: { select: { id: true, status: true } } },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    return this.mapUserProfile(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.first_name !== undefined && { first_name: dto.first_name }),
        ...(dto.last_name !== undefined && { last_name: dto.last_name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.avatar_url !== undefined && { avatar_url: dto.avatar_url }),
      },
      include: { vendor: { select: { id: true, status: true } } },
    });

    return this.mapUserProfile(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found.',
      });
    }

    const isCurrentValid = await bcrypt.compare(
      dto.current_password,
      user.password_hash,
    );

    if (!isCurrentValid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Current password is incorrect.',
      });
    }

    if (dto.current_password === dto.new_password) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'New password must be different from the current password.',
      });
    }

    const rounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '12'));
    const password_hash = await bcrypt.hash(dto.new_password, rounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash,
        refresh_token: null,
      },
    });

    return { message: 'Password changed successfully.' };
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: 'desc' }, { id: 'asc' }],
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    if (dto.is_default) {
      await this.clearDefaultAddress(userId);
    }

    const addressCount = await this.prisma.address.count({
      where: { user_id: userId },
    });

    return this.prisma.address.create({
      data: {
        user_id: userId,
        full_name: dto.full_name,
        phone: dto.phone,
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        state: dto.state,
        postal_code: dto.postal_code,
        country: dto.country,
        is_default: dto.is_default ?? addressCount === 0,
      },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ) {
    await this.findOwnedAddress(userId, addressId);

    if (dto.is_default) {
      await this.clearDefaultAddress(userId);
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: {
        ...(dto.full_name !== undefined && { full_name: dto.full_name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.line1 !== undefined && { line1: dto.line1 }),
        ...(dto.line2 !== undefined && { line2: dto.line2 }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.postal_code !== undefined && { postal_code: dto.postal_code }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.is_default !== undefined && { is_default: dto.is_default }),
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.findOwnedAddress(userId, addressId);

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    if (address.is_default) {
      const nextAddress = await this.prisma.address.findFirst({
        where: { user_id: userId },
        orderBy: { id: 'asc' },
      });

      if (nextAddress) {
        await this.prisma.address.update({
          where: { id: nextAddress.id },
          data: { is_default: true },
        });
      }
    }

    return { message: 'Address deleted successfully.' };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    await this.findOwnedAddress(userId, addressId);
    await this.clearDefaultAddress(userId);

    return this.prisma.address.update({
      where: { id: addressId },
      data: { is_default: true },
    });
  }

  private async findOwnedAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, user_id: userId },
    });

    if (!address) {
      throw new NotFoundException({
        code: 'ADDRESS_NOT_FOUND',
        message: 'Address not found.',
      });
    }

    return address;
  }

  private async clearDefaultAddress(userId: string) {
    await this.prisma.address.updateMany({
      where: { user_id: userId, is_default: true },
      data: { is_default: false },
    });
  }

  private mapUserProfile(user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    avatar_url: string | null;
    phone: string | null;
    is_verified: boolean;
    created_at: Date;
    vendor: { id: string; status: string } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      avatar_url: user.avatar_url,
      phone: user.phone,
      is_verified: user.is_verified,
      created_at: user.created_at,
      vendor: user.vendor
        ? { id: user.vendor.id, status: user.vendor.status }
        : null,
    };
  }
}
