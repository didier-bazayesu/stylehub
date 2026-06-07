import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class UpdateProductStatusDto {
  @ApiProperty({ enum: [ProductStatus.ACTIVE, ProductStatus.ARCHIVED] })
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
