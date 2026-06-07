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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const vendors_service_1 = require("../vendors/vendors.service");
const cloudinary_service_1 = require("../common/cloudinary/cloudinary.service");
const slug_util_1 = require("../common/utils/slug.util");
let StoresService = class StoresService {
    prisma;
    vendorsService;
    cloudinaryService;
    constructor(prisma, vendorsService, cloudinaryService) {
        this.prisma = prisma;
        this.vendorsService = vendorsService;
        this.cloudinaryService = cloudinaryService;
    }
    async getBySlug(slug) {
        const store = await this.prisma.store.findFirst({
            where: { slug, is_active: true },
            include: {
                vendor: {
                    select: {
                        id: true,
                        business_name: true,
                        status: true,
                    },
                },
            },
        });
        if (!store) {
            throw new common_1.NotFoundException({
                code: 'STORE_NOT_FOUND',
                message: 'Store not found.',
            });
        }
        return {
            id: store.id,
            name: store.name,
            slug: store.slug,
            logo_url: store.logo_url,
            banner_url: store.banner_url,
            description: store.description,
            vendor: store.vendor,
            created_at: store.created_at,
        };
    }
    async getStoreProducts(slug, query) {
        const store = await this.prisma.store.findFirst({
            where: { slug, is_active: true },
        });
        if (!store) {
            throw new common_1.NotFoundException({
                code: 'STORE_NOT_FOUND',
                message: 'Store not found.',
            });
        }
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = {
            vendor_id: store.vendor_id,
            status: client_1.ProductStatus.ACTIVE,
            deleted_at: null,
        };
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    images: {
                        where: { is_primary: true },
                        take: 1,
                    },
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data: products.map((product) => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                base_price: product.base_price,
                avg_rating: product.avg_rating,
                review_count: product.review_count,
                is_featured: product.is_featured,
                image: product.images[0]?.url ?? null,
                category: product.category,
            })),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async create(userId, dto) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const existingStore = await this.prisma.store.findFirst({
            where: { vendor_id: vendor.id },
        });
        if (existingStore) {
            throw new common_1.ConflictException({
                code: 'STORE_ALREADY_EXISTS',
                message: 'You already have a store. Use PATCH to update it.',
            });
        }
        const slug = await this.ensureUniqueSlug(dto.slug ?? (0, slug_util_1.slugify)(dto.name));
        const store = await this.prisma.store.create({
            data: {
                vendor_id: vendor.id,
                name: dto.name,
                slug,
                description: dto.description,
            },
        });
        return this.mapStore(store);
    }
    async update(userId, dto) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const store = await this.findVendorStore(vendor.id);
        let slug = store.slug;
        if (dto.slug && dto.slug !== store.slug) {
            slug = await this.ensureUniqueSlug(dto.slug, store.id);
        }
        else if (dto.name && !dto.slug) {
            const generatedSlug = (0, slug_util_1.slugify)(dto.name);
            if (generatedSlug !== store.slug) {
                slug = await this.ensureUniqueSlug(generatedSlug, store.id);
            }
        }
        const updated = await this.prisma.store.update({
            where: { id: store.id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.is_active !== undefined && { is_active: dto.is_active }),
                slug,
            },
        });
        return this.mapStore(updated);
    }
    async uploadLogo(userId, file) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const store = await this.findVendorStore(vendor.id);
        const upload = await this.cloudinaryService.uploadImage(file, 'stores/logos');
        const updated = await this.prisma.store.update({
            where: { id: store.id },
            data: { logo_url: upload.url },
        });
        return this.mapStore(updated);
    }
    async uploadBanner(userId, file) {
        const vendor = await this.vendorsService.requireApprovedVendor(userId);
        const store = await this.findVendorStore(vendor.id);
        const upload = await this.cloudinaryService.uploadImage(file, 'stores/banners');
        const updated = await this.prisma.store.update({
            where: { id: store.id },
            data: { banner_url: upload.url },
        });
        return this.mapStore(updated);
    }
    async findVendorStore(vendorId) {
        const store = await this.prisma.store.findFirst({
            where: { vendor_id: vendorId },
        });
        if (!store) {
            throw new common_1.NotFoundException({
                code: 'STORE_NOT_FOUND',
                message: 'Store not found. Create your store first.',
            });
        }
        return store;
    }
    async ensureUniqueSlug(baseSlug, excludeStoreId) {
        const slug = (0, slug_util_1.slugify)(baseSlug);
        let candidate = slug;
        let counter = 1;
        while (true) {
            const existing = await this.prisma.store.findFirst({
                where: {
                    slug: candidate,
                    ...(excludeStoreId && { NOT: { id: excludeStoreId } }),
                },
            });
            if (!existing) {
                return candidate;
            }
            candidate = `${slug}-${counter}`;
            counter += 1;
        }
    }
    mapStore(store) {
        return {
            id: store.id,
            name: store.name,
            slug: store.slug,
            logo_url: store.logo_url,
            banner_url: store.banner_url,
            description: store.description,
            is_active: store.is_active,
            created_at: store.created_at,
            updated_at: store.updated_at,
        };
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vendors_service_1.VendorsService,
        cloudinary_service_1.CloudinaryService])
], StoresService);
//# sourceMappingURL=stores.service.js.map