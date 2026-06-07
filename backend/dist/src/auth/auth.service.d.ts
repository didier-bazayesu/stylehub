import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private readonly logger;
    private readonly resend;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: import("@prisma/client").$Enums.Role;
            avatar_url: string | null;
            is_verified: boolean;
            vendor: {
                id: string;
                status: import("@prisma/client").$Enums.VendorStatus;
            } | null;
        };
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            id: string;
            email: string;
            first_name: string;
            last_name: string;
            role: import("@prisma/client").$Enums.Role;
            avatar_url: string | null;
            is_verified: boolean;
            vendor: {
                id: string;
                status: import("@prisma/client").$Enums.VendorStatus;
            } | null;
        };
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: import("@prisma/client").$Enums.Role;
        avatar_url: string | null;
        phone: string | null;
        is_verified: boolean;
        created_at: Date;
        vendor: {
            id: string;
            status: import("@prisma/client").$Enums.VendorStatus;
        } | null;
    }>;
    private generateTokens;
    private sendVerificationEmail;
    private sendPasswordResetEmail;
}
