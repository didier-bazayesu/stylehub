"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const vendors_service_1 = require("../vendors/vendors.service");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
const dto_1 = require("./dto");
const slug_util_1 = require("../common/utils/slug.util");
let ProductsService = class ProductsService {
    prisma;
    vendorsService;
    cloudinaryService;
    constructor(prisma, vendorsService, cloudinaryService) {
        this.prisma = prisma;
        this.vendorsService = vendorsService;
        this.cloudinaryService = cloudinaryService;
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = {
            status: client_1.ProductStatus.ACTIVE,
            deleted_at: null,
        };
        if (query.category) {
            where.category = { slug: query.category };
        }
        if (query.vendor) {
            where.vendor = { store: { slug: query.vendor } };
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            where.base_price = {
                ...(query.minPrice !== undefined && { gte: query.minPrice }),
                ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
            };
        }
        const orderBy = this.getSortOrder(query.sort);
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    images: { where: { is_primary: true }, take: 1 },
                    category: { select: { id: true, name: true, slug: true } },
                    vendor: {
                        select: {
                            id: true,
                            business_name: true,
                            store: { select: { name: true, slug: true } },
                        },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data: products.map((product) => this.mapProductListItem(product)),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findFeatured() {
        const products = await this.prisma.product.findMany({
            where: {
                status: client_1.ProductStatus.ACTIVE,
                is_featured: true,
                deleted_at: null,
            },
            take: 12,
            orderBy: { created_at: 'desc' },
            include: {
                images: { where: { is_primary: true }, take: 1 },
                category: { select: { id: true, name: true, slug: true } },
            },
        });
        return products.map((product) => this.mapProductListItem(product));
    }
    async findBySlug(slug) {
        const product = await this.prisma.product.findFirst({
            where: {
                slug,
                status: client_1.ProductStatus.ACTIVE,
                deleted_at: null,
            },
            include: {
                images: { orderBy: { display_order: 'asc' } },
                variants: { orderBy: { price: 'asc' } },
                category: { select: { id: true, name: true, slug: true } },
                vendor: {
                    select: {
                        id: true,
                        business_name: true,
                        store: { select: { name: true, slug: true, logo_url: true } },
                    },
                },
                reviews: {
                    where: { deleted_at: null },
                    take: 5,
                    orderBy: { created_at: 'desc' },
                    include: {
                        user: {
                            select: { first_name: true, last_name: true, avatar_url: true },
                        },
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException({
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found.',
            });
        }
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            base_price: product.base_price,
            status: product.status,
            is_featured: product.is_featured,
            total_stock: product.total_stock,
            avg_rating: product.avg_rating,
            review_count: product.review_count,
            images: product.images,
            variants: product.variants,
            category: product.category,
            vendor: product.vendor,
            reviews: product.reviews.map((review) => ({
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                is_verified_purchase: review.is_verified_purchase,
                created_at: review.created_at,
                user: {
                    first_name: review.user.first_name,
                    last_name: review.user.last_name,
                    avatar_url: review.user.avatar_url,
                },
            })),
            created_at: product.created_at,
        };
    }
    async create(userId, dto) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        await this.ensureCategoryExists(dto.category_id);
        const slug = await this.ensureUniqueSlug(dto.slug ?? (0, slug_util_1.slugify)(dto.name));
        const product = await this.prisma.product.create({
            data: {
                vendor_id: vendor.id,
                category_id: dto.category_id,
                name: dto.name,
                slug,
                description: dto.description,
                base_price: dto.base_price,
                status: client_1.ProductStatus.DRAFT,
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });
        return this.mapProductDetail(product);
    }
    async update(userId, productId, dto) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const product = await this.findOwnedProduct(vendor.id, productId);
        if (dto.category_id) {
            await this.ensureCategoryExists(dto.category_id);
        }
        let slug = product.slug;
        if (dto.slug && dto.slug !== product.slug) {
            slug = await this.ensureUniqueSlug(dto.slug, product.id);
        }
        else if (dto.name && !dto.slug) {
            const generatedSlug = (0, slug_util_1.slugify)(dto.name);
            if (generatedSlug !== product.slug) {
                slug = await this.ensureUniqueSlug(generatedSlug, product.id);
            }
        }
        const updated = await this.prisma.product.update({
            where: { id: product.id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.category_id !== undefined && { category_id: dto.category_id }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.base_price !== undefined && { base_price: dto.base_price }),
                slug,
            },
            include: {
                images: { orderBy: { display_order: 'asc' } },
                variants: true,
                category: { select: { id: true, name: true, slug: true } },
            },
        });
        return this.mapProductDetail(updated);
    }
    async updateStatus(userId, productId, dto) {
        if (dto.status !== client_1.ProductStatus.ACTIVE &&
            dto.status !== client_1.ProductStatus.ARCHIVED) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'Status can only be set to ACTIVE or ARCHIVED.',
            });
        }
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const product = await this.findOwnedProduct(vendor.id, productId);
        if (dto.status === client_1.ProductStatus.ACTIVE) {
            const variantCount = await this.prisma.productVariant.count({
                where: { product_id: product.id },
            });
            if (variantCount === 0) {
                throw new common_1.BadRequestException({
                    code: 'VALIDATION_ERROR',
                    message: 'Add at least one variant before publishing.',
                });
            }
        }
        const updated = await this.prisma.product.update({
            where: { id: product.id },
            data: { status: dto.status },
        });
        return {
            id: updated.id,
            status: updated.status,
            message: dto.status === client_1.ProductStatus.ACTIVE
                ? 'Product published successfully.'
                : 'Product archived successfully.',
        };
    }
    async remove(userId, productId) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const product = await this.findOwnedProduct(vendor.id, productId);
        await this.prisma.product.update({
            where: { id: product.id },
            data: { deleted_at: new Date(), status: client_1.ProductStatus.ARCHIVED },
        });
        return { message: 'Product deleted successfully.' };
    }
    async addImages(userId, productId, files) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const product = await this.findOwnedProduct(vendor.id, productId);
        const existingCount = await this.prisma.productImage.count({
            where: { product_id: product.id },
        });
        if (existingCount + files.length > 5) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'A product can have at most 5 images.',
            });
        }
        const uploads = await Promise.all(files.map((file) => this.cloudinaryService.uploadImage(file, 'products')));
        const hasPrimary = existingCount > 0;
        const images = await this.prisma.$transaction(uploads.map((upload, index) => this.prisma.productImage.create({
            data: {
                product_id: product.id,
                url: upload.url,
                public_id: upload.public_id,
                is_primary: !hasPrimary && index === 0,
                display_order: existingCount + index,
            },
        })));
        return images;
    }
    async removeImage(userId, productId, imageId) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        await this.findOwnedProduct(vendor.id, productId);
        const image = await this.prisma.productImage.findFirst({
            where: { id: imageId, product_id: productId },
        });
        if (!image) {
            throw new common_1.NotFoundException({
                code: 'IMAGE_NOT_FOUND',
                message: 'Product image not found.',
            });
        }
        await this.cloudinaryService.deleteImage(image.public_id);
        await this.prisma.productImage.delete({ where: { id: imageId } });
        if (image.is_primary) {
            const nextImage = await this.prisma.productImage.findFirst({
                where: { product_id: productId },
                orderBy: { display_order: 'asc' },
            });
            if (nextImage) {
                await this.prisma.productImage.update({
                    where: { id: nextImage.id },
                    data: { is_primary: true },
                });
            }
        }
        return { message: 'Image deleted successfully.' };
    }
    async addVariant(userId, productId, dto) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        await this.findOwnedProduct(vendor.id, productId);
        const existingSku = await this.prisma.productVariant.findFirst({
            where: { sku: dto.sku },
        });
        if (existingSku) {
            throw new common_1.ConflictException({
                code: 'DUPLICATE_ENTRY',
                message: 'A variant with this SKU already exists.',
            });
        }
        const variant = await this.prisma.$transaction(async (tx) => {
            const created = await tx.productVariant.create({
                data: {
                    product_id: productId,
                    sku: dto.sku,
                    size: dto.size,
                    color: dto.color,
                    price: dto.price,
                    stock: dto.stock,
                },
            });
            await this.syncProductStock(tx, productId);
            return created;
        });
        return variant;
    }
    async updateVariant(userId, productId, variantId, dto) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        await this.findOwnedProduct(vendor.id, productId);
        await this.findOwnedVariant(productId, variantId);
        const variant = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.productVariant.update({
                where: { id: variantId },
                data: {
                    ...(dto.size !== undefined && { size: dto.size }),
                    ...(dto.color !== undefined && { color: dto.color }),
                    ...(dto.price !== undefined && { price: dto.price }),
                    ...(dto.stock !== undefined && { stock: dto.stock }),
                },
            });
            await this.syncProductStock(tx, productId);
            return updated;
        });
        return variant;
    }
    async removeVariant(userId, productId, variantId) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        await this.findOwnedProduct(vendor.id, productId);
        await this.findOwnedVariant(productId, variantId);
        await this.prisma.$transaction(async (tx) => {
            await tx.productVariant.delete({ where: { id: variantId } });
            await this.syncProductStock(tx, productId);
        });
        return { message: 'Variant deleted successfully.' };
    }
    async findOwnedProduct(vendorId, productId) {
        const product = await this.prisma.product.findFirst({
            where: { id: productId, vendor_id: vendorId, deleted_at: null },
        });
        if (!product) {
            throw new common_1.NotFoundException({
                code: 'PRODUCT_NOT_FOUND',
                message: 'Product not found.',
            });
        }
        return product;
    }
    async findOwnedVariant(productId, variantId) {
        const variant = await this.prisma.productVariant.findFirst({
            where: { id: variantId, product_id: productId },
        });
        if (!variant) {
            throw new common_1.NotFoundException({
                code: 'VARIANT_NOT_FOUND',
                message: 'Product variant not found.',
            });
        }
        return variant;
    }
    async ensureCategoryExists(categoryId) {
        const category = await this.prisma.category.findFirst({
            where: { id: categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException({
                code: 'CATEGORY_NOT_FOUND',
                message: 'Category not found.',
            });
        }
    }
    async ensureUniqueSlug(baseSlug, excludeProductId) {
        const slug = (0, slug_util_1.slugify)(baseSlug);
        let candidate = slug;
        let counter = 1;
        while (true) {
            const existing = await this.prisma.product.findFirst({
                where: {
                    slug: candidate,
                    ...(excludeProductId && { NOT: { id: excludeProductId } }),
                },
            });
            if (!existing) {
                return candidate;
            }
            candidate = `${slug}-${counter}`;
            counter += 1;
        }
    }
    async syncProductStock(tx, productId) {
        const aggregate = await tx.productVariant.aggregate({
            where: { product_id: productId },
            _sum: { stock: true },
        });
        await tx.product.update({
            where: { id: productId },
            data: { total_stock: aggregate._sum.stock ?? 0 },
        });
    }
    getSortOrder(sort) {
        switch (sort) {
            case dto_1.ProductSort.PRICE_ASC:
                return { base_price: 'asc' };
            case dto_1.ProductSort.PRICE_DESC:
                return { base_price: 'desc' };
            case dto_1.ProductSort.RATING:
                return { avg_rating: 'desc' };
            case dto_1.ProductSort.NEWEST:
            default:
                return { created_at: 'desc' };
        }
    }
    mapProductListItem(product) {
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            base_price: product.base_price,
            avg_rating: product.avg_rating,
            review_count: product.review_count,
            is_featured: product.is_featured,
            image: product.images[0]?.url ?? null,
            category: product.category,
            vendor: product.vendor,
        };
    }
    mapProductDetail(product) {
        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            base_price: product.base_price,
            status: product.status,
            is_featured: product.is_featured,
            total_stock: product.total_stock,
            category: product.category,
            images: product.images ?? [],
            variants: product.variants ?? [],
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vendors_service_1.VendorsService,
        cloudinary_service_1.CloudinaryService])
], ProductsService);
//# sourceMappingURL=products.service.js.map