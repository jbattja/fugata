import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { Amount } from '@fugata/shared';

export class CreateRefundDto {

  @ApiProperty({ description: 'The amount to be refunded' })
  @ValidateNested()
  @Type(() => Amount)
  @IsNotEmpty({ message: 'Amount is required' })
  amount: Amount;

  @ApiProperty({ description: 'Reference for the refund', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

}
