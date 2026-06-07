import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        message: string;
    }>;
    login(dto: LoginDto, response: Response): Promise<{
        access_token: string;
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
    refresh(user: any, response: Response): Promise<{
        access_token: string;
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
    logout(userId: string, response: Response): Promise<{
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
}
