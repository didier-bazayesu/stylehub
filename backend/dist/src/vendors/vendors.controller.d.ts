import { VendorsService } from './vendors.service';
import { ApplyVendorDto, UpdateVendorDto } from './dto';
export declare class VendorsController {
    private readonly vendorsService;
    constructor(vendorsService: VendorsService);
    apply(userId: string, dto: ApplyVendorDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.VendorStatus;
        business_name: string;
        business_email: string;
        description: string | null;
        message: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.VendorStatus;
        business_name: string;
        business_email: string;
        description: string | null;
        rejection_reason: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    updateMe(userId: string, dto: UpdateVendorDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.VendorStatus;
        business_name: string;
        business_email: string;
        description: string | null;
        rejection_reason: string | null;
        created_at: Date;
        updated_at: Date;
    }>;
    getStats(userId: string): Promise<{
        total_revenue: number | import("@prisma/client-runtime-utils").Decimal;
        total_orders: number;
        total_products: number;
        total_customers: number;
    }>;
}
