import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AnalyticsService } from './analytics.service';
import { AnalyticsPeriod, AnalyticsPeriodDto } from './dto';
import { CurrentUser, Roles } from '../common/decorators';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('vendor/overview')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Vendor dashboard overview stats' })
  getVendorOverview(@CurrentUser('id') userId: string) {
    return this.analyticsService.getVendorOverview(userId);
  }

  @Get('vendor/revenue')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Vendor revenue chart data' })
  getVendorRevenue(
    @CurrentUser('id') userId: string,
    @Query() query: AnalyticsPeriodDto,
  ) {
    return this.analyticsService.getVendorRevenue(
      userId,
      query.period ?? AnalyticsPeriod.THIRTY_DAYS,
    );
  }

  @Get('vendor/top-products')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Top products by revenue for vendor' })
  getVendorTopProducts(@CurrentUser('id') userId: string) {
    return this.analyticsService.getVendorTopProducts(userId);
  }

  @Get('admin/overview')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Platform-wide admin overview stats' })
  getAdminOverview() {
    return this.analyticsService.getAdminOverview();
  }

  @Get('admin/vendors')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Vendor performance leaderboard' })
  getAdminVendors() {
    return this.analyticsService.getAdminVendors();
  }
}
