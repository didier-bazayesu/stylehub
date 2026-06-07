import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  variant_id: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
