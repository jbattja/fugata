import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsDate, IsEnum } from "class-validator";
import { Amount } from "./amount";

export enum CaptureStatus {
    INITIATED = 'INITIATED',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED',
    SETTLED = 'SETTLED',
    REVERSED = 'REVERSED'
}

export class Capture {

    @IsString()
    @IsNotEmpty()
    captureId!: string;

    @IsString()
    @IsNotEmpty()
    paymentId: string;

    @ValidateNested()
    @Type(() => Amount)
    @IsOptional()
    amount?: Amount;

    @IsString()
    @IsOptional()
    captureReference?: string;

    @IsEnum(CaptureStatus)
    @IsOptional()
    status?: CaptureStatus;

    @IsString()
    @IsOptional()
    refusalReason?: string;

    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @IsDate()
    @IsOptional()
    updatedAt?: Date;

    constructor(partial: Partial<Capture>) {
        Object.assign(this, partial);
      }    
}
