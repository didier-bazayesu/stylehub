import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly resend: Resend;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  // ── Register ────────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Check for existing user
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const rounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '12'));
    const password_hash = await bcrypt.hash(dto.password, rounds);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password_hash,
        first_name: dto.first_name,
        last_name: dto.last_name,
        email_verification_token: emailVerificationToken,
      },
    });

    // Send verification email
    await this.sendVerificationEmail(user.email, emailVerificationToken);

    // Notify admins of new user registration (informational)
    await this.notificationsService.notifyAdmins({
      type: NotificationType.SYSTEM,
      title: 'New user registered',
      message: `${user.first_name} ${user.last_name} (${user.email}) just created an account.`,
      data: { user_id: user.id },
    });

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  // ── Login ───────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    this.logger.log(`Login attempt for email: ${dto.email.toLowerCase()}`);
    
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
      include: { vendor: { select: { id: true, status: true } } },
    });

    if (!user) {
      this.logger.warn(`User not found: ${dto.email.toLowerCase()}`);
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    this.logger.log(`User found: ${user.email}, is_active: ${user.is_active}, role: ${user.role}`);

    if (!user.is_active) {
      this.logger.warn(`User account deactivated: ${user.email}`);
      throw new UnauthorizedException({
        code: 'ACCOUNT_DEACTIVATED',
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    
    this.logger.log(`Password validation result: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${user.email}`);
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      vendorId: user.vendor?.id,
    });

    // Hash and store refresh token
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

  // ── Refresh Token ───────────────────────────────────────────────
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: { vendor: { select: { id: true, status: true } } },
    });

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException({
        code: 'TOKEN_INVALID',
        message: 'Invalid refresh token.',
      });
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!isTokenValid) {
      throw new UnauthorizedException({
        code: 'TOKEN_INVALID',
        message: 'Invalid refresh token.',
      });
    }

    // Rotate tokens
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

  // ── Logout ──────────────────────────────────────────────────────
  async logout(userId: string) {
    await this.prisma.user.updateMany({
      where: { id: userId },
      data: { refresh_token: null },
    });
    return { message: 'Logged out successfully' };
  }

  // ── Verify Email ────────────────────────────────────────────────
  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findFirst({
      where: { email_verification_token: dto.token },
    });

    if (!user) {
      throw new BadRequestException({
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

  // ── Forgot Password ────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message:
          'If an account with that email exists, a reset link has been sent.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.updateMany({
      where: { id: user.id },
      data: {
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
      },
    });

    await this.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        'If an account with that email exists, a reset link has been sent.',
    };
  }

  // ── Reset Password ─────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        password_reset_token: dto.token,
        password_reset_expires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException({
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
        refresh_token: null, // invalidate all sessions
      },
    });

    return {
      message:
        'Password reset successfully. Please log in with your new password.',
    };
  }

  // ── Get Current User ───────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: { vendor: { select: { id: true, status: true } } },
    });

    if (!user) {
      throw new UnauthorizedException({
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

  // ── Private Helpers ─────────────────────────────────────────────

  private async generateTokens(payload: JwtPayload) {
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

  private async sendVerificationEmail(email: string, token: string) {
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.configService.get(
          'RESEND_FROM_EMAIL',
          'onboarding@resend.dev',
        ),
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
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        error,
      );
      // Don't throw — registration still succeeds even if email fails
    }
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.configService.get(
          'RESEND_FROM_EMAIL',
          'onboarding@resend.dev',
        ),
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
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
    }
  }
}
