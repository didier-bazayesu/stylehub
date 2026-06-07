import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectVendorDto {
  @ApiProperty({ example: 'Incomplete business documentation provided.' })
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reason: string;
}
