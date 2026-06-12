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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const resend_1 = require("resend");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    resend;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.resend = new resend_1.Resend(this.configService.get('RESEND_API_KEY'));
    }
    async register(dto) {
        const existing = await this.prisma.user.findFirst({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: 'EMAIL_ALREADY_EXISTS',
                message: 'An account with this email already exists.',
            });
        }
        const rounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '12'));
        const password_hash = await bcrypt.hash(dto.password, rounds);
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                password_hash,
                first_name: dto.first_name,
                last_name: dto.last_name,
                email_verification_token: emailVerificationToken,
            },
        });
        await this.sendVerificationEmail(user.email, emailVerificationToken);
        return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            message: 'Registration successful. Please check your email to verify your account.',
        };
    }
    async login(dto) {
        this.logger.log(`Login attempt for email: ${dto.email.toLowerCase()}`);
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email.toLowerCase() },
            include: { vendor: { select: { id: true, status: true } } },
        });
        if (!user) {
            this.logger.warn(`User not found: ${dto.email.toLowerCase()}`);
            throw new common_1.UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password.',
            });
        }
        this.logger.log(`User found: ${user.email}, is_active: ${user.is_active}, role: ${user.role}`);
        if (!user.is_active) {
            this.logger.warn(`User account deactivated: ${user.email}`);
            throw new common_1.UnauthorizedException({
                code: 'ACCOUNT_DEACTIVATED',
                message: 'Your account has been deactivated. Contact support.',
            });
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
        this.logger.log(`Password validation result: ${isPasswordValid}`);
        if (!isPasswordValid) {
            this.logger.warn(`Invalid password for user: ${user.email}`);
            throw new common_1.UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password.',
            });
        }
        const tokens = await this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
            vendorId: user.vendor?.id,
        });
        const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);
        await this.prisma.user.updateMany({
            where: { id: user.id },
            data: { refresh_token: hashedRefreshToken },
        });
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                avatar_url: user.avatar_url,
                is_verified: user.is_verified,
                vendor: user.vendor
                    ? { id: user.vendor.id, status: user.vendor.status }
                    : null,
            },
        };
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
            include: { vendor: { select: { id: true, status: true } } },
        });
        if (!user || !user.refresh_token) {
            throw new common_1.UnauthorizedException({
                code: 'TOKEN_INVALID',
                message: 'Invalid refresh token.',
            });
        }
        const isTokenValid = await bcrypt.compare(refreshToken, user.refresh_token);
        if (!isTokenValid) {
            throw new common_1.UnauthorizedException({
                code: 'TOKEN_INVALID',
                message: 'Invalid refresh token.',
            });
        }
        const tokens = await this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role,
            vendorId: user.vendor?.id,
        });
        const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);
        await this.prisma.user.updateMany({
            where: { id: user.id },
            data: { refresh_token: hashedRefreshToken },
        });
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                avatar_url: user.avatar_url,
                is_verified: user.is_verified,
                vendor: user.vendor
                    ? { id: user.vendor.id, status: user.vendor.status }
                    : null,
            },
        };
    }
    async logout(userId) {
        await this.prisma.user.updateMany({
            where: { id: userId },
            data: { refresh_token: null },
        });
        return { message: 'Logged out successfully' };
    }
    async verifyEmail(dto) {
        const user = await this.prisma.user.findFirst({
            where: { email_verification_token: dto.token },
        });
        if (!user) {
            throw new common_1.BadRequestException({
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired verification token.',
            });
        }
        await this.prisma.user.updateMany({
            where: { id: user.id },
            data: {
                is_verified: true,
                email_verification_token: null,
            },
        });
        return { message: 'Email verified successfully. You can now log in.' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user) {
            return {
                message: 'If an account with that email exists, a reset link has been sent.',
            };
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await this.prisma.user.updateMany({
            where: { id: user.id },
            data: {
                password_reset_token: resetToken,
                password_reset_expires: resetExpires,
            },
        });
        await this.sendPasswordResetEmail(user.email, resetToken);
        return {
            message: 'If an account with that email exists, a reset link has been sent.',
        };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                password_reset_token: dto.token,
                password_reset_expires: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException({
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired reset token.',
            });
        }
        const rounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '12'));
        const password_hash = await bcrypt.hash(dto.password, rounds);
        await this.prisma.user.updateMany({
            where: { id: user.id },
            data: {
                password_hash,
                password_reset_token: null,
                password_reset_expires: null,
                refresh_token: null,
            },
        });
        return {
            message: 'Password reset successfully. Please log in with your new password.',
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId },
            include: { vendor: { select: { id: true, status: true } } },
        });
        if (!user) {
            throw new common_1.UnauthorizedException({
                code: 'USER_NOT_FOUND',
                message: 'User not found.',
            });
        }
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
    async generateTokens(payload) {
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRES', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '7d'),
            }),
        ]);
        return { access_token, refresh_token };
    }
    async sendVerificationEmail(email, token) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
        const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
        try {
            await this.resend.emails.send({
                from: this.configService.get('RESEND_FROM_EMAIL', 'onboarding@resend.dev'),
                to: email,
                subject: 'Verify your StyleHub account',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a2e;">Welcome to StyleHub!</h1>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verifyUrl}" 
               style="display: inline-block; padding: 12px 24px; background: #6c5ce7; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
              Verify Email
            </a>
            <p style="color: #666;">Or copy and paste this link: ${verifyUrl}</p>
            <p style="color: #999; font-size: 12px;">If you didn't create an account, ignore this email.</p>
          </div>
        `,
            });
        }
        catch (error) {
            this.logger.error(`Failed to send verification email to ${email}:`, error);
        }
    }
    async sendPasswordResetEmail(email, token) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
        const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
        try {
            await this.resend.emails.send({
                from: this.configService.get('RESEND_FROM_EMAIL', 'onboarding@resend.dev'),
                to: email,
                subject: 'Reset your StyleHub password',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a2e;">Password Reset</h1>
            <p>You requested a password reset. Click the button below to set a new password:</p>
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 24px; background: #6c5ce7; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
              Reset Password
            </a>
            <p style="color: #666;">Or copy and paste this link: ${resetUrl}</p>
            <p style="color: #999; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
          </div>
        `,
            });
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}:`, error);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map