import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@fugata/shared';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john.doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@example.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'password',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'admin',
    required: true,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    description: 'Merchant IDs of the user',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    required: true,
  })
  @IsString({ each: true })
  @IsOptional()
  merchantIds: string[];
} 