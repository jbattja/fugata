import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateNested, IsNotEmpty, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Amount } from '@fugata/shared';

export class CreateCaptureDto {

  @ApiProperty({ description: 'The amount to be captured' })
  @ValidateNested()
  @Type(() => Amount)
  @IsNotEmpty({ message: 'Amount is required' })
  amount: Amount;

  @ApiProperty({ description: 'Reference for the capture', required: false })
  @IsString()
  @IsOptional()
  captureReference?: string;

  @ApiProperty({ description: 'Indicates if this is the final capture', required: false })
  @IsBoolean()
  @IsOptional()
  finalCapture?: boolean = false;
}
