import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsDate, IsEnum } from "class-validator";
import { Amount } from "./amount";

export enum OperationType {
    CAPTURE = 'CAPTURE',
    REFUND = 'REFUND',
    VOID = 'VOID'
}

export enum OperationStatus {
    INITIATED = 'INITIATED',
    SUCCEEDED = 'SUCCEEDED',
    FAILED = 'FAILED',
    SETTLED = 'SETTLED',
    REVERSED = 'REVERSED',
    ERROR = 'ERROR'
}

export abstract class Operation {
    @IsString()
    @IsNotEmpty()
    operationId!: string;

    @IsEnum(OperationType)
    @IsNotEmpty()
    operationType!: OperationType;

    @IsString()
    @IsNotEmpty()
    paymentId!: string;

    @ValidateNested()
    @Type(() => Amount)
    @IsOptional()
    amount?: Amount;

    @IsString()
    @IsOptional()
    reference?: string;

    @IsEnum(OperationStatus)
    @IsOptional()
    status?: OperationStatus;

    @IsString()
    @IsOptional()
    refusalReason?: string;

    @IsString()
    @IsOptional()
    partnerReference?: string;

    @IsDate()
    @IsOptional()
    createdAt?: Date;

    @IsDate()
    @IsOptional()
    updatedAt?: Date;

    constructor(partial: Partial<Operation>) {
        Object.assign(this, partial);
    }
}

export class Capture extends Operation {
    @IsEnum(OperationType)
    @IsNotEmpty()
    operationType: OperationType = OperationType.CAPTURE;

    constructor(partial: Partial<Capture>) {
        super(partial);
        this.operationType = OperationType.CAPTURE;
        Object.assign(this, partial);
    }
}

export class Refund extends Operation {
    @IsEnum(OperationType)
    @IsNotEmpty()
    operationType: OperationType = OperationType.REFUND;

    constructor(partial: Partial<Refund>) {
        super(partial);
        this.operationType = OperationType.REFUND;
        Object.assign(this, partial);
    }
}

export class Void extends Operation {
    @IsEnum(OperationType)
    @IsNotEmpty()
    operationType: OperationType = OperationType.VOID;

    constructor(partial: Partial<Void>) {
        super(partial);
        this.operationType = OperationType.VOID;
        Object.assign(this, partial);
    }
}