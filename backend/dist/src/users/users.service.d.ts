import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto, CreateAddressDto, UpdateAddressDto } from './dto';
export declare class UsersService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        avatar_url: string | null;
        phone: string | null;
        is_verified: boolean;
        created_at: Date;
        vendor: {
            id: string;
            status: string;
        } | null;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        avatar_url: string | null;
        phone: string | null;
        is_verified: boolean;
        created_at: Date;
        vendor: {
            id: string;
            status: string;
        } | null;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getAddresses(userId: string): Promise<{
        id: string;
        phone: string;
        user_id: string;
        full_name: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        is_default: boolean;
    }[]>;
    createAddress(userId: string, dto: CreateAddressDto): Promise<{
        id: string;
        phone: string;
        user_id: string;
        full_name: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        is_default: boolean;
    }>;
    updateAddress(userId: string, addressId: string, dto: UpdateAddressDto): Promise<{
        id: string;
        phone: string;
        user_id: string;
        full_name: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        is_default: boolean;
    }>;
    deleteAddress(userId: string, addressId: string): Promise<{
        message: string;
    }>;
    setDefaultAddress(userId: string, addressId: string): Promise<{
        id: string;
        phone: string;
        user_id: string;
        full_name: string;
        line1: string;
        line2: string | null;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        is_default: boolean;
    }>;
    private findOwnedAddress;
    private clearDefaultAddress;
    private mapUserProfile;
}
