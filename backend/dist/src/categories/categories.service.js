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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const slug_util_1 = require("../common/utils/slug.util");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const categories = await this.prisma.category.findMany({
            where: { parent_id: null },
            include: {
                children: {
                    orderBy: { name: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        });
        return categories.map((category) => this.mapCategory(category));
    }
    async findBySlug(slug) {
        const category = await this.prisma.category.findFirst({
            where: { slug },
            include: {
                children: {
                    orderBy: { name: 'asc' },
                },
                parent: true,
            },
        });
        if (!category) {
            throw new common_1.NotFoundException({
                code: 'CATEGORY_NOT_FOUND',
                message: 'Category not found.',
            });
        }
        return this.mapCategory(category);
    }
    async create(dto) {
        if (dto.parent_id) {
            await this.ensureCategoryExists(dto.parent_id);
        }
        const slug = await this.ensureUniqueSlug(dto.slug ?? (0, slug_util_1.slugify)(dto.name));
        const category = await this.prisma.category.create({
            data: {
                name: dto.name,
                slug,
                image_url: dto.image_url,
                parent_id: dto.parent_id,
            },
            include: {
                children: true,
            },
        });
        return this.mapCategory(category);
    }
    async update(id, dto) {
        const category = await this.ensureCategoryExists(id);
        if (dto.parent_id === id) {
            throw new common_1.BadRequestException({
                code: 'VALIDATION_ERROR',
                message: 'A category cannot be its own parent.',
            });
        }
        if (dto.parent_id) {
            await this.ensureCategoryExists(dto.parent_id);
        }
        let slug = category.slug;
        if (dto.slug && dto.slug !== category.slug) {
            slug = await this.ensureUniqueSlug(dto.slug, id);
        }
        else if (dto.name && !dto.slug) {
            const generatedSlug = (0, slug_util_1.slugify)(dto.name);
            if (generatedSlug !== category.slug) {
                slug = await this.ensureUniqueSlug(generatedSlug, id);
            }
        }
        const updated = await this.prisma.category.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.image_url !== undefined && { image_url: dto.image_url }),
                ...(dto.parent_id !== undefined && { parent_id: dto.parent_id }),
                slug,
            },
            include: {
                children: true,
                parent: true,
            },
        });
        return this.mapCategory(updated);
    }
    async remove(id) {
        await this.ensureCategoryExists(id);
        const [childCount, productCount] = await Promise.all([
            this.prisma.category.count({ where: { parent_id: id } }),
            this.prisma.product.count({ where: { category_id: id, deleted_at: null } }),
        ]);
        if (childCount > 0) {
            throw new common_1.ConflictException({
                code: 'CATEGORY_HAS_CHILDREN',
                message: 'Cannot delete a category that has subcategories.',
            });
        }
        if (productCount > 0) {
            throw new common_1.ConflictException({
                code: 'CATEGORY_HAS_PRODUCTS',
                message: 'Cannot delete a category that has products.',
            });
        }
        await this.prisma.category.delete({ where: { id } });
        return { message: 'Category deleted successfully.' };
    }
    async ensureCategoryExists(id) {
        const category = await this.prisma.category.findFirst({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException({
                code: 'CATEGORY_NOT_FOUND',
                message: 'Category not found.',
            });
        }
        return category;
    }
    async ensureUniqueSlug(baseSlug, excludeCategoryId) {
        const slug = (0, slug_util_1.slugify)(baseSlug);
        let candidate = slug;
        let counter = 1;
        while (true) {
            const existing = await this.prisma.category.findFirst({
                where: {
                    slug: candidate,
                    ...(excludeCategoryId && { NOT: { id: excludeCategoryId } }),
                },
            });
            if (!existing) {
                return candidate;
            }
            candidate = `${slug}-${counter}`;
            counter += 1;
        }
    }
    mapCategory(category) {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            image_url: category.image_url,
            parent_id: category.parent_id,
            parent: category.parent
                ? {
                    id: category.parent.id,
                    name: category.parent.name,
                    slug: category.parent.slug,
                }
                : null,
            children: category.children?.map((child) => ({
                id: child.id,
                name: child.name,
                slug: child.slug,
                image_url: child.image_url,
                parent_id: child.parent_id,
            })),
        };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map