import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VendorsService } from '../vendors/vendors.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { PaginationQueryDto } from '../common/dto';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class StoresService {
  constructor(
    private prisma: PrismaService,
    private vendorsService: VendorsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async getBySlug(slug: string) {
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
      throw new NotFoundException({
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

  async getStoreProducts(slug: string, query: PaginationQueryDto) {
    const store = await this.prisma.store.findFirst({
      where: { slug, is_active: true },
    });

    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        message: 'Store not found.',
      });
    }

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      vendor_id: store.vendor_id,
      status: ProductStatus.ACTIVE,
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

  async create(userId: string, dto: CreateStoreDto) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);

    const existingStore = await this.prisma.store.findFirst({
      where: { vendor_id: vendor.id },
    });

    if (existingStore) {
      throw new ConflictException({
        code: 'STORE_ALREADY_EXISTS',
        message: 'You already have a store. Use PATCH to update it.',
      });
    }

    const slug = await this.ensureUniqueSlug(dto.slug ?? slugify(dto.name));

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

  async update(userId: string, dto: UpdateStoreDto) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const store = await this.findVendorStore(vendor.id);

    let slug = store.slug;
    if (dto.slug && dto.slug !== store.slug) {
      slug = await this.ensureUniqueSlug(dto.slug, store.id);
    } else if (dto.name && !dto.slug) {
      const generatedSlug = slugify(dto.name);
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

  async uploadLogo(userId: string, file: Express.Multer.File) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const store = await this.findVendorStore(vendor.id);
    const upload = await this.cloudinaryService.uploadImage(file, 'stores/logos');

    const updated = await this.prisma.store.update({
      where: { id: store.id },
      data: { logo_url: upload.url },
    });

    return this.mapStore(updated);
  }

  async uploadBanner(userId: string, file: Express.Multer.File) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const store = await this.findVendorStore(vendor.id);
    const upload = await this.cloudinaryService.uploadImage(file, 'stores/banners');

    const updated = await this.prisma.store.update({
      where: { id: store.id },
      data: { banner_url: upload.url },
    });

    return this.mapStore(updated);
  }

  private async findVendorStore(vendorId: string) {
    const store = await this.prisma.store.findFirst({
      where: { vendor_id: vendorId },
    });

    if (!store) {
      throw new NotFoundException({
        code: 'STORE_NOT_FOUND',
        message: 'Store not found. Create your store first.',
      });
    }

    return store;
  }

  private async ensureUniqueSlug(baseSlug: string, excludeStoreId?: string) {
    const slug = slugify(baseSlug);
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

  private mapStore(store: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    banner_url: string | null;
    description: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }) {
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
}
