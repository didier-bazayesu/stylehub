import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  order_id: string;
}
