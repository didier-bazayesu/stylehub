import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { AdminService } from './admin.service';
import {
  AdminUsersQueryDto,
  UpdateUserStatusDto,
  AdminVendorsQueryDto,
  RejectVendorDto,
  AdminProductsQueryDto,
  AdminOrdersQueryDto,
  CreateCouponDto,
  UpdateCouponDto,
} from './dto';
import { CurrentUser, Roles } from '../common/decorators';
import { PaginationQueryDto } from '../common/dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Activate or deactivate a user' })
  updateUserStatus(
    @CurrentUser('id') adminId: string,
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: Request,
  ) {
    return this.adminService.updateUserStatus(adminId, userId, dto, req.ip);
  }

  @Get('vendors')
  @ApiOperation({ summary: 'List all vendors' })
  listVendors(@Query() query: AdminVendorsQueryDto) {
    return this.adminService.listVendors(query);
  }

  @Patch('vendors/:id/approve')
  @ApiOperation({ summary: 'Approve vendor application' })
  approveVendor(
    @CurrentUser('id') adminId: string,
    @Param('id') vendorId: string,
    @Req() req: Request,
  ) {
    return this.adminService.approveVendor(adminId, vendorId, req.ip);
  }

  @Patch('vendors/:id/reject')
  @ApiOperation({ summary: 'Reject vendor application' })
  rejectVendor(
    @CurrentUser('id') adminId: string,
    @Param('id') vendorId: string,
    @Body() dto: RejectVendorDto,
    @Req() req: Request,
  ) {
    return this.adminService.rejectVendor(adminId, vendorId, dto, req.ip);
  }

  @Patch('vendors/:id/suspend')
  @ApiOperation({ summary: 'Suspend vendor' })
  suspendVendor(
    @CurrentUser('id') adminId: string,
    @Param('id') vendorId: string,
    @Req() req: Request,
  ) {
    return this.adminService.suspendVendor(adminId, vendorId, req.ip);
  }

  @Get('products')
  @ApiOperation({ summary: 'List all platform products' })
  listProducts(@Query() query: AdminProductsQueryDto) {
    return this.adminService.listProducts(query);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Force-delete a product' })
  forceDeleteProduct(
    @CurrentUser('id') adminId: string,
    @Param('id') productId: string,
    @Req() req: Request,
  ) {
    return this.adminService.forceDeleteProduct(adminId, productId, req.ip);
  }

  @Get('orders')
  @ApiOperation({ summary: 'List all platform orders' })
  listOrders(@Query() query: AdminOrdersQueryDto) {
    return this.adminService.listOrders(query);
  }

  @Patch('orders/items/:id/cancel')
  @ApiOperation({ summary: 'Cancel an order item (admin)' })
  cancelOrderItem(
    @CurrentUser('id') adminId: string,
    @Param('id') orderItemId: string,
    @Req() req: Request,
  ) {
    return this.adminService.cancelOrderItem(adminId, orderItemId, req.ip);
  }

  @Patch('orders/items/:id/refund')
  @ApiOperation({ summary: 'Refund an order item (admin)' })
  refundOrderItem(
    @CurrentUser('id') adminId: string,
    @Param('id') orderItemId: string,
    @Req() req: Request,
  ) {
    return this.adminService.refundOrderItem(adminId, orderItemId, req.ip);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'List audit log entries' })
  listAuditLogs(@Query() query: PaginationQueryDto) {
    return this.adminService.listAuditLogs(query);
  }

  @Get('coupons')
  @ApiOperation({ summary: 'List all coupons' })
  listCoupons() {
    return this.adminService.listCoupons();
  }

  @Post('coupons')
  @ApiOperation({ summary: 'Create a coupon' })
  createCoupon(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateCouponDto,
    @Req() req: Request,
  ) {
    return this.adminService.createCoupon(adminId, dto, req.ip);
  }

  @Patch('coupons/:id')
  @ApiOperation({ summary: 'Update a coupon' })
  updateCoupon(
    @CurrentUser('id') adminId: string,
    @Param('id') couponId: string,
    @Body() dto: UpdateCouponDto,
    @Req() req: Request,
  ) {
    return this.adminService.updateCoupon(adminId, couponId, dto, req.ip);
  }

  @Delete('coupons/:id')
  @ApiOperation({ summary: 'Delete a coupon' })
  deleteCoupon(
    @CurrentUser('id') adminId: string,
    @Param('id') couponId: string,
    @Req() req: Request,
  ) {
    return this.adminService.deleteCoupon(adminId, couponId, req.ip);
  }
}
