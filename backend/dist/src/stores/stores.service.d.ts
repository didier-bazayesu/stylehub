import { PrismaService } from '../prisma/prisma.service';
import { VendorsService } from '../vendors/vendors.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { PaginationQueryDto } from '../common/dto';
export declare class StoresService {
    private prisma;
    private vendorsService;
    private cloudinaryService;
    constructor(prisma: PrismaService, vendorsService: VendorsService, cloudinaryService: CloudinaryService);
    getBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        banner_url: string | null;
        description: string | null;
        vendor: {
            id: string;
            status: import("@prisma/client").$Enums.VendorStatus;
            business_name: string;
        };
        created_at: Date;
    }>;
    getStoreProducts(slug: string, query: PaginationQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            slug: string;
            base_price: import("@prisma/client-runtime-utils").Decimal;
            avg_rating: number;
            review_count: number;
            is_featured: boolean;
            image: string;
            category: {
                id: string;
                name: string;
                slug: string;
            };
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    create(userId: string, dto: CreateStoreDto): Promise<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        banner_url: string | null;
        description: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    update(userId: string, dto: UpdateStoreDto): Promise<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        banner_url: string | null;
        description: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    uploadLogo(userId: string, file: Express.Multer.File): Promise<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        banner_url: string | null;
        description: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    uploadBanner(userId: string, file: Express.Multer.File): Promise<{
        id: string;
        name: string;
        slug: string;
        logo_url: string | null;
        banner_url: string | null;
        description: string | null;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    private findVendorStore;
    private ensureUniqueSlug;
    private mapStore;
}
