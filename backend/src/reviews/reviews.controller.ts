import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { Public, CurrentUser, Roles } from '../common/decorators';
import { PaginationQueryDto } from '../common/dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('products/:productId')
  @ApiOperation({ summary: 'List reviews for a product' })
  findByProduct(
    @Param('productId') productId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.reviewsService.findByProduct(productId, query);
  }

  @Post('products/:productId')
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.VENDOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a review for a purchased product' })
  create(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, productId, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.VENDOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update own review' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(userId, reviewId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.VENDOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete own review' })
  remove(@CurrentUser('id') userId: string, @Param('id') reviewId: string) {
    return this.reviewsService.remove(userId, reviewId);
  }
}
