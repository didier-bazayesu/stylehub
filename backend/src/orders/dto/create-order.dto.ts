import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  address_id: string;

  @ApiPropertyOptional({ example: 'SAVE10' })
  @IsOptional()
  @IsString()
  coupon_code?: string;

  @ApiPropertyOptional({ example: 'Please leave at the front door.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
