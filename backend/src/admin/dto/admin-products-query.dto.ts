import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto';

export class AdminProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'urban-threads' })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiPropertyOptional({ example: 'men' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 'denim' })
  @IsOptional()
  @IsString()
  search?: string;
}
