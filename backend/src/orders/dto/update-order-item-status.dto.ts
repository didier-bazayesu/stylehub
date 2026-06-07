import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

const vendorStatuses = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
] as const;

export class UpdateOrderItemStatusDto {
  @ApiProperty({ enum: vendorStatuses })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
