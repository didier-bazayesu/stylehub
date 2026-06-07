import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyVendorDto {
  @ApiProperty({ example: 'Urban Threads Co.' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  business_name: string;

  @ApiProperty({ example: 'contact@urbanthreads.com' })
  @IsEmail()
  business_email: string;

  @ApiPropertyOptional({ example: 'Premium streetwear for modern lifestyles.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
