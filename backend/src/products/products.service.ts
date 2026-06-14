import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma, ArchiveReason, ProductStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VendorsService } from '../vendors/vendors.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  CreateVariantDto,
  UpdateVariantDto,
  ProductQueryDto,
  ProductSort,
} from './dto';
import { slugify } from '../common/utils/slug.util';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private vendorsService: VendorsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: ProductQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
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
        status: ProductStatus.ACTIVE,
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

  // ─── Vendor: own product list (ALL statuses) ─────────────────────────────
  // Used by the vendor dashboard — returns products of any status so the
  // vendor can see their DRAFT, ACTIVE, ARCHIVED products all in one list.

  async findOwn(userId: string, query: ProductQueryDto) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      vendor_id: vendor.id,
      deleted_at: null, // exclude soft-deleted products
    };

    // Allow filtering by status from the vendor dashboard tabs
    if (query.status) {
      where.status = query.status as ProductStatus;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
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
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => this.mapProductListItem(product)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: ProductStatus.ACTIVE,
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
      throw new NotFoundException({
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
        user: review.user
            ? {
                first_name: review.user.first_name,
                last_name: review.user.last_name,
                avatar_url: review.user.avatar_url,
              }
            : null,
      })),
      created_at: product.created_at,
    };
  }

  async findOwnProductBySlug(userId: string, slug: string) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);

    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        vendor_id: vendor.id,
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
      throw new NotFoundException({
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
        user: review.user
            ? {
                first_name: review.user.first_name,
                last_name: review.user.last_name,
                avatar_url: review.user.avatar_url,
              }
            : null,
      })),
      created_at: product.created_at,
    };
  }

  async create(userId: string, dto: CreateProductDto) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    await this.ensureCategoryExists(dto.category_id);

    const slug = await this.ensureUniqueSlug(dto.slug ?? slugify(dto.name));

    const product = await this.prisma.product.create({
      data: {
        vendor_id: vendor.id,
        category_id: dto.category_id,
        name: dto.name,
        slug,
        description: dto.description,
        base_price: dto.base_price,
        status: ProductStatus.DRAFT,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return this.mapProductDetail(product);
  }

  async update(userId: string, productId: string, dto: UpdateProductDto) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const product = await this.findOwnedProduct(vendor.id, productId);

    if (dto.category_id) {
      await this.ensureCategoryExists(dto.category_id);
    }

    let slug = product.slug;
    if (dto.slug && dto.slug !== product.slug) {
      slug = await this.ensureUniqueSlug(dto.slug, product.id);
    } else if (dto.name && !dto.slug) {
      const generatedSlug = slugify(dto.name);
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

  async updateStatus(
    userId: string,
    productId: string,
    dto: UpdateProductStatusDto,
  ) {
    if (
      dto.status !== ProductStatus.ACTIVE &&
      dto.status !== ProductStatus.ARCHIVED
    ) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Status can only be set to ACTIVE or ARCHIVED.',
      });
    }

    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const product = await this.findOwnedProduct(vendor.id, productId);

    if (dto.status === ProductStatus.ACTIVE) {
      const variantCount = await this.prisma.productVariant.count({
        where: { product_id: product.id },
      });

      if (variantCount === 0) {
        throw new BadRequestException({
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
      message:
        dto.status === ProductStatus.ACTIVE
          ? 'Product published successfully.'
          : 'Product archived successfully.',
    };
  }

  async remove(userId: string, productId: string) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const product = await this.findOwnedProduct(vendor.id, productId);

    // Soft-delete: product stays in DB so existing OrderItems keep their reference.
    // archive_reason = MANUAL distinguishes this from a system-driven archive
    // (VENDOR_DISABLED) so the product is NOT auto-restored if the vendor
    // account is later reactivated.
    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        deleted_at: new Date(),
        status: ProductStatus.ARCHIVED,
        archive_reason: ArchiveReason.MANUAL,
      },
    });

    return { message: 'Product deleted successfully.' };
  }

  async addImages(
    userId: string,
    productId: string,
    files: Express.Multer.File[],
  ) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    const product = await this.findOwnedProduct(vendor.id, productId);

    const existingCount = await this.prisma.productImage.count({
      where: { product_id: product.id },
    });

    if (existingCount + files.length > 5) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'A product can have at most 5 images.',
      });
    }

    const uploads = await Promise.all(
      files.map((file) =>
        this.cloudinaryService.uploadImage(file, 'products'),
      ),
    );

    const hasPrimary = existingCount > 0;

    const images = await this.prisma.$transaction(
      uploads.map((upload, index) =>
        this.prisma.productImage.create({
          data: {
            product_id: product.id,
            url: upload.url,
            public_id: upload.public_id,
            is_primary: !hasPrimary && index === 0,
            display_order: existingCount + index,
          },
        }),
      ),
    );

    return images;
  }

  async removeImage(userId: string, productId: string, imageId: string) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    await this.findOwnedProduct(vendor.id, productId);

    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, product_id: productId },
    });

    if (!image) {
      throw new NotFoundException({
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

  async addVariant(userId: string, productId: string, dto: CreateVariantDto) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    await this.findOwnedProduct(vendor.id, productId);

    const existingSku = await this.prisma.productVariant.findFirst({
      where: { sku: dto.sku },
    });

    if (existingSku) {
      throw new ConflictException({
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

  async updateVariant(
    userId: string,
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ) {
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

  async removeVariant(userId: string, productId: string, variantId: string) {
    const vendor = await this.vendorsService.requireApprovedVendor(userId);
    await this.findOwnedProduct(vendor.id, productId);
    await this.findOwnedVariant(productId, variantId);

    await this.prisma.$transaction(async (tx) => {
      await tx.productVariant.delete({ where: { id: variantId } });
      await this.syncProductStock(tx, productId);
    });

    return { message: 'Variant deleted successfully.' };
  }

  private async findOwnedProduct(vendorId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, vendor_id: vendorId, deleted_at: null },
    });

    if (!product) {
      throw new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      });
    }

    return product;
  }

  private async findOwnedVariant(productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, product_id: productId },
    });

    if (!variant) {
      throw new NotFoundException({
        code: 'VARIANT_NOT_FOUND',
        message: 'Product variant not found.',
      });
    }

    return variant;
  }

  private async ensureCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Category not found.',
      });
    }
  }

  private async ensureUniqueSlug(baseSlug: string, excludeProductId?: string) {
    const slug = slugify(baseSlug);
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

  private async syncProductStock(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    const aggregate = await tx.productVariant.aggregate({
      where: { product_id: productId },
      _sum: { stock: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: { total_stock: aggregate._sum.stock ?? 0 },
    });
  }

  private getSortOrder(sort?: ProductSort): Prisma.ProductOrderByWithRelationInput {
    switch (sort) {
      case ProductSort.PRICE_ASC:
        return { base_price: 'asc' };
      case ProductSort.PRICE_DESC:
        return { base_price: 'desc' };
      case ProductSort.RATING:
        return { avg_rating: 'desc' };
      case ProductSort.NEWEST:
      default:
        return { created_at: 'desc' };
    }
  }

  private mapProductListItem(product: {
    id: string;
    name: string;
    slug: string;
    status: ProductStatus;
    base_price: Prisma.Decimal;
    avg_rating: number;
    review_count: number;
    total_stock: number;
    is_featured: boolean;
    images: Array<{ url: string }>;
    category: { id: string; name: string; slug: string };
    vendor?: {
      id: string;
      business_name: string;
      store: { name: string; slug: string } | null;
    };
  }) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
      base_price: product.base_price,
      avg_rating: product.avg_rating,
      review_count: product.review_count,
      total_stock: product.total_stock,
      is_featured: product.is_featured,
      image: product.images[0]?.url ?? null,
      category: product.category,
      vendor: product.vendor,
    };
  }

  private mapProductDetail(product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    base_price: Prisma.Decimal;
    status: ProductStatus;
    is_featured: boolean;
    total_stock: number;
    category: { id: string; name: string; slug: string };
    images?: Array<{
      id: string;
      url: string;
      is_primary: boolean;
      display_order: number;
    }>;
    variants?: Array<{
      id: string;
      sku: string;
      size: string | null;
      color: string | null;
      price: Prisma.Decimal;
      stock: number;
    }>;
  }) {
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
}
