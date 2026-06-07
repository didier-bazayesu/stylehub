import { Controller, Post, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { VendorsService } from './vendors.service';
import { ApplyVendorDto, UpdateVendorDto } from './dto';
import { CurrentUser, Roles } from '../common/decorators';

@ApiTags('Vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post('apply')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Apply to become a vendor' })
  apply(@CurrentUser('id') userId: string, @Body() dto: ApplyVendorDto) {
    return this.vendorsService.apply(userId, dto);
  }

  @Get('me')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Get current vendor profile' })
  getMe(@CurrentUser('id') userId: string) {
    return this.vendorsService.getMe(userId);
  }

  @Patch('me')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Update current vendor profile' })
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateVendorDto) {
    return this.vendorsService.updateMe(userId, dto);
  }

  @Get('me/stats')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Get vendor overview statistics' })
  getStats(@CurrentUser('id') userId: string) {
    return this.vendorsService.getStats(userId);
  }
}
