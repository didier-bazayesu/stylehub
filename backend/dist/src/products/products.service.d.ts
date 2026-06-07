import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VendorsService } from '../vendors/vendors.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CreateProductDto, UpdateProductDto, UpdateProductStatusDto, CreateVariantDto, UpdateVariantDto, ProductQueryDto } from './dto';
export declare class ProductsService {
    private prisma;
    private vendorsService;
    private cloudinaryService;
    constructor(prisma: PrismaService, vendorsService: VendorsService, cloudinaryService: CloudinaryService);
    findAll(query: ProductQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            slug: string;
            base_price: Prisma.Decimal;
            avg_rating: number;
            review_count: number;
            is_featured: boolean;
            image: string;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            vendor: {
                id: string;
                business_name: string;
                store: {
                    name: string;
                    slug: string;
                } | null;
            } | undefined;
        }[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findFeatured(): Promise<{
        id: string;
        name: string;
        slug: string;
        base_price: Prisma.Decimal;
        avg_rating: number;
        review_count: number;
        is_featured: boolean;
        image: string;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        vendor: {
            id: string;
            business_name: string;
            store: {
                name: string;
                slug: string;
            } | null;
        } | undefined;
    }[]>;
    findBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string;
        base_price: Prisma.Decimal;
        status: import("@prisma/client").$Enums.ProductStatus;
        is_featured: boolean;
        total_stock: number;
        avg_rating: number;
        review_count: number;
        images: {
            url: string;
            id: string;
            product_id: string;
            public_id: string;
            is_primary: boolean;
            display_order: number;
        }[];
        variants: {
            id: string;
            product_id: string;
            sku: string;
            size: string | null;
            color: string | null;
            price: Prisma.Decimal;
            stock: number;
        }[];
        category: {
            id: string;
            name: string;
            slug: string;
        };
        vendor: {
            id: string;
            store: {
                name: string;
                slug: string;
                logo_url: string | null;
            } | null;
            business_name: string;
        };
        reviews: {
            id: string;
            rating: number;
            comment: string | null;
            is_verified_purchase: boolean;
            created_at: Date;
            user: {
                first_name: string;
                last_name: string;
                avatar_url: string | null;
            };
        }[];
        created_at: Date;
    }>;
    create(userId: string, dto: CreateProductDto): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string;
        base_price: Prisma.Decimal;
        status: import("@prisma/client").$Enums.ProductStatus;
        is_featured: boolean;
        total_stock: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
            is_primary: boolean;
            display_order: number;
        }[];
        variants: {
            id: string;
            sku: string;
            size: string | null;
            color: string | null;
            price: Prisma.Decimal;
            stock: number;
        }[];
    }>;
    update(userId: string, productId: string, dto: UpdateProductDto): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string;
        base_price: Prisma.Decimal;
        status: import("@prisma/client").$Enums.ProductStatus;
        is_featured: boolean;
        total_stock: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
            is_primary: boolean;
            display_order: number;
        }[];
        variants: {
            id: string;
            sku: string;
            size: string | null;
            color: string | null;
            price: Prisma.Decimal;
            stock: number;
        }[];
    }>;
    updateStatus(userId: string, productId: string, dto: UpdateProductStatusDto): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.ProductStatus;
        message: string;
    }>;
    remove(userId: string, productId: string): Promise<{
        message: string;
    }>;
    addImages(userId: string, productId: string, files: Express.Multer.File[]): Promise<{
        url: string;
        id: string;
        product_id: string;
        public_id: string;
        is_primary: boolean;
        display_order: number;
    }[]>;
    removeImage(userId: string, productId: string, imageId: string): Promise<{
        message: string;
    }>;
    addVariant(userId: string, productId: string, dto: CreateVariantDto): Promise<{
        id: string;
        product_id: string;
        sku: string;
        size: string | null;
        color: string | null;
        price: Prisma.Decimal;
        stock: number;
    }>;
    updateVariant(userId: string, productId: string, variantId: string, dto: UpdateVariantDto): Promise<{
        id: string;
        product_id: string;
        sku: string;
        size: string | null;
        color: string | null;
        price: Prisma.Decimal;
        stock: number;
    }>;
    removeVariant(userId: string, productId: string, variantId: string): Promise<{
        message: string;
    }>;
    private findOwnedProduct;
    private findOwnedVariant;
    private ensureCategoryExists;
    private ensureUniqueSlug;
    private syncProductStock;
    private getSortOrder;
    private mapProductListItem;
    private mapProductDetail;
}
