import { IsString, IsEnum, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { CardNetwork } from '@fugata/shared';

export class BinLookupDto {
  @IsString()
  @IsNotEmpty()
  bin: string;
}

export class BinLookupResponseDto {
  bin: string;
  cardNetwork: CardNetwork;
  issuerName: string;
  cardType: string;
  cardCategory: string;
  countryCode: string;
  countryName: string;
  bankName?: string;
  bankWebsite?: string;
  bankPhone?: string;
  isPrepaid: boolean;
}

export class CreateBinLookupDto {
  @IsString()
  bin: string;

  @IsEnum(CardNetwork)
  cardNetwork: CardNetwork;

  @IsString()
  issuerName: string;

  @IsString()
  cardType: string;

  @IsString()
  cardCategory: string;

  @IsString()
  countryCode: string;

  @IsString()
  countryName: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankWebsite?: string;

  @IsString()
  @IsOptional()
  bankPhone?: string;

  @IsBoolean()
  @IsOptional()
  isPrepaid?: boolean;

}
