import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderItemStatusDto } from './dto';
import { CurrentUser, Roles } from '../common/decorators';
import { PaginationQueryDto } from '../common/dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.CUSTOMER, Role.VENDOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create order from cart' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(userId, dto);
  }

  @Get('vendor')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'List orders containing vendor products' })
  findAllForVendor(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.ordersService.findAllForVendor(userId, query);
  }

  @Patch('vendor/:orderItemId/status')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Update order item status' })
  updateOrderItemStatus(
    @CurrentUser('id') userId: string,
    @Param('orderItemId') orderItemId: string,
    @Body() dto: UpdateOrderItemStatusDto,
  ) {
    return this.ordersService.updateOrderItemStatus(userId, orderItemId, dto);
  }

  @Get()
  @Roles(Role.CUSTOMER, Role.VENDOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List own orders' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.ordersService.findAllForUser(userId, query);
  }

  @Get(':id')
  @Roles(Role.CUSTOMER, Role.VENDOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get order details' })
  findById(@CurrentUser('id') userId: string, @Param('id') orderId: string) {
    return this.ordersService.findById(userId, orderId);
  }
}
