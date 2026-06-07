"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
            include: { vendor: { select: { id: true, status: true } } },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'User not found.',
            });
        }
        return this.mapUserProfile(user);
    }
    async updateProfile(userId, dto) {
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
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'User not found.',
            });
        }
        const isCurrentValid = await bcrypt.compare(dto.current_password, user.password_hash);
        if (!isCurrentValid) {
            throw new common_1.UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: 'Current password is incorrect.',
            });
        }
        if (dto.current_password === dto.new_password) {
            throw new common_1.BadRequestException({
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
    async getAddresses(userId) {
        return this.prisma.address.findMany({
            where: { user_id: userId },
            orderBy: [{ is_default: 'desc' }, { id: 'asc' }],
        });
    }
    async createAddress(userId, dto) {
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
    async updateAddress(userId, addressId, dto) {
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
    async deleteAddress(userId, addressId) {
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
    async setDefaultAddress(userId, addressId) {
        await this.findOwnedAddress(userId, addressId);
        await this.clearDefaultAddress(userId);
        return this.prisma.address.update({
            where: { id: addressId },
            data: { is_default: true },
        });
    }
    async findOwnedAddress(userId, addressId) {
        const address = await this.prisma.address.findFirst({
            where: { id: addressId, user_id: userId },
        });
        if (!address) {
            throw new common_1.NotFoundException({
                code: 'ADDRESS_NOT_FOUND',
                message: 'Address not found.',
            });
        }
        return address;
    }
    async clearDefaultAddress(userId) {
        await this.prisma.address.updateMany({
            where: { user_id: userId, is_default: true },
            data: { is_default: false },
        });
    }
    mapUserProfile(user) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map