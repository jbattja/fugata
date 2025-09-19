import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateVoidDto {

  @ApiProperty({ description: 'Reference for the void', required: false })
  @IsString()
  @IsOptional()
  reference?: string;

}
