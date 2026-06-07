import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Outerwear' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'outerwear' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/example/category.jpg' })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  parent_id?: string;
}
