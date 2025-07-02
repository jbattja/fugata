import { IsString, IsOptional, IsNotEmpty, IsDate, IsEnum } from 'class-validator';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

export enum UserStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
}

export class User {
    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsString()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsOptional()
    passwordHash?: string;

    @IsString({ each: true })
    @IsOptional()
    merchantIds?: string[];

    @IsEnum(UserRole)
    @IsNotEmpty()
    role!: UserRole;

    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;

    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @IsDate()
    @IsOptional()
    updatedAt?: Date;
} 
