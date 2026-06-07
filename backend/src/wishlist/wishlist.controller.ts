import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { WishlistService } from './wishlist.service';
import { AddWishlistItemDto } from './dto';
import { CurrentUser, Roles } from '../common/decorators';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Roles(Role.CUSTOMER, Role.VENDOR, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get wishlist with product details' })
  getWishlist(@CurrentUser('id') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add product to wishlist' })
  addItem(
    @CurrentUser('id') userId: string,
    @Body() dto: AddWishlistItemDto,
  ) {
    return this.wishlistService.addItem(userId, dto.product_id);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeItem(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeItem(userId, productId);
  }
}
