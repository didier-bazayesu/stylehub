import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

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

  async findBySlug(slug: string) {
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
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found.',
      });
    }

    return this.mapCategory(category);
  }

  async create(dto: CreateCategoryDto) {
    if (dto.parent_id) {
      await this.ensureCategoryExists(dto.parent_id);
    }

    const slug = await this.ensureUniqueSlug(dto.slug ?? slugify(dto.name));

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

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.ensureCategoryExists(id);

    if (dto.parent_id === id) {
      throw new BadRequestException({
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
    } else if (dto.name && !dto.slug) {
      const generatedSlug = slugify(dto.name);
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

  async remove(id: string) {
    await this.ensureCategoryExists(id);

    const [childCount, productCount] = await Promise.all([
      this.prisma.category.count({ where: { parent_id: id } }),
      this.prisma.product.count({ where: { category_id: id, deleted_at: null } }),
    ]);

    if (childCount > 0) {
      throw new ConflictException({
        code: 'CATEGORY_HAS_CHILDREN',
        message: 'Cannot delete a category that has subcategories.',
      });
    }

    if (productCount > 0) {
      throw new ConflictException({
        code: 'CATEGORY_HAS_PRODUCTS',
        message: 'Cannot delete a category that has products.',
      });
    }

    await this.prisma.category.delete({ where: { id } });

    return { message: 'Category deleted successfully.' };
  }

  private async ensureCategoryExists(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found.',
      });
    }

    return category;
  }

  private async ensureUniqueSlug(baseSlug: string, excludeCategoryId?: string) {
    const slug = slugify(baseSlug);
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

  private mapCategory(category: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    parent_id: string | null;
    children?: Array<{
      id: string;
      name: string;
      slug: string;
      image_url: string | null;
      parent_id: string | null;
    }>;
    parent?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }) {
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
}
