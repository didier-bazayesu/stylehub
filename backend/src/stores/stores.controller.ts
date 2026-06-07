import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { memoryStorage } from 'multer';
import { StoresService } from './stores.service';
import { CreateStoreDto, UpdateStoreDto } from './dto';
import { Public, CurrentUser, Roles } from '../common/decorators';
import { PaginationQueryDto } from '../common/dto';

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

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Create a store (one per vendor)' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateStoreDto) {
    return this.storesService.create(userId, dto);
  }

  @Patch()
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Update current vendor store' })
  update(@CurrentUser('id') userId: string, @Body() dto: UpdateStoreDto) {
    return this.storesService.update(userId, dto);
  }

  @Post('logo')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload store logo' })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  uploadLogo(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: 'FILE_REQUIRED',
        message: 'Image file is required.',
      });
    }

    return this.storesService.uploadLogo(userId, file);
  }

  @Post('banner')
  @ApiBearerAuth()
  @Roles(Role.VENDOR)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload store banner' })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  uploadBanner(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: 'FILE_REQUIRED',
        message: 'Image file is required.',
      });
    }

    return this.storesService.uploadBanner(userId, file);
  }

  @Public()
  @Get(':slug/products')
  @ApiOperation({ summary: 'List products for a store' })
  getStoreProducts(
    @Param('slug') slug: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.storesService.getStoreProducts(slug, query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get public store page by slug' })
  getBySlug(@Param('slug') slug: string) {
    return this.storesService.getBySlug(slug);
  }
}
