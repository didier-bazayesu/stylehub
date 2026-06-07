import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVendorDto {
  @ApiPropertyOptional({ example: 'Urban Threads Co.' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  business_name?: string;

  @ApiPropertyOptional({ example: 'contact@urbanthreads.com' })
  @IsOptional()
  @IsEmail()
  business_email?: string;

  @ApiPropertyOptional({ example: 'Premium streetwear for modern lifestyles.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
