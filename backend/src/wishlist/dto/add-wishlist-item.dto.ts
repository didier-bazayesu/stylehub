import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddWishlistItemDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  product_id: string;
}
