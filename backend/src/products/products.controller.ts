import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  CreateVariantDto,
  UpdateVariantDto,
  ProductQueryDto,
} from './dto';
import { Public, CurrentUser, Roles } from '../common/decorators';

const imageUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      callback(
        new BadRequestException({
          code: 'INVALID_FILE_TYPE',
          message: 'Only JPEG, PNG, and WebP images are allowed.',
        }),
        false,
      );
      return;
    }

    callback(null, true);
  },
};

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'List featured products' })
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products with filters' })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get single product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Create a product (defaults to DRAFT)' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Update own product' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(userId, productId, dto);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Publish or archive a product' })
  updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return this.productsService.updateStatus(userId, productId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Soft delete own product' })
  remove(@CurrentUser('id') userId: string, @Param('id') productId: string) {
    return this.productsService.remove(userId, productId);
  }

  @Post(':id/images')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product images (up to 5 total)' })
  @UseInterceptors(FilesInterceptor('files', 5, imageUploadOptions))
  addImages(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files?.length) {
      throw new BadRequestException({
        code: 'FILE_REQUIRED',
        message: 'At least one image file is required.',
      });
    }

    return this.productsService.addImages(userId, productId, files);
  }

  @Delete(':id/images/:imageId')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Delete a product image' })
  removeImage(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.removeImage(userId, productId, imageId);
  }

  @Post(':id/variants')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Add a variant to a product' })
  addVariant(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
    @Body() dto: CreateVariantDto,
  ) {
    return this.productsService.addVariant(userId, productId, dto);
  }

  @Patch(':id/variants/:variantId')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Update a product variant' })
  updateVariant(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariant(
      userId,
      productId,
      variantId,
      dto,
    );
  }

  @Delete(':id/variants/:variantId')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Delete a product variant' })
  removeVariant(
    @CurrentUser('id') userId: string,
    @Param('id') productId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.productsService.removeVariant(userId, productId, variantId);
  }
}
