import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BinLookup } from '../entities/bin-lookup.entity';
import { BinLookupResponseDto, CreateBinLookupDto } from '../dto/bin-lookup.dto';
import { CardNetwork } from '@fugata/shared';

@Injectable()
export class BinLookupService {
  constructor(
    @InjectRepository(BinLookup)
    private binLookupRepository: Repository<BinLookup>,
  ) {}

  async lookupBin(bin: string): Promise<BinLookupResponseDto> {
    const binLookup = await this.binLookupRepository.findOne({
      where: { bin }
    });

    if (!binLookup) {
      throw new NotFoundException(`BIN ${bin} not found`);
    }

    return this.mapToResponseDto(binLookup);
  }

  async createBinLookup(createBinLookupDto: CreateBinLookupDto): Promise<BinLookupResponseDto> {
    const existingBin = await this.binLookupRepository.findOne({
      where: { bin: createBinLookupDto.bin }
    });

    if (existingBin) {
      throw new Error(`BIN ${createBinLookupDto.bin} already exists`);
    }

    const binLookup = this.binLookupRepository.create(createBinLookupDto);
    const savedBinLookup = await this.binLookupRepository.save(binLookup);

    return this.mapToResponseDto(savedBinLookup);
  }

  async updateBinLookup(bin: string, updateData: Partial<CreateBinLookupDto>): Promise<BinLookupResponseDto> {
    const binLookup = await this.binLookupRepository.findOne({
      where: { bin }
    });

    if (!binLookup) {
      throw new NotFoundException(`BIN ${bin} not found`);
    }

    Object.assign(binLookup, updateData);
    const updatedBinLookup = await this.binLookupRepository.save(binLookup);

    return this.mapToResponseDto(updatedBinLookup);
  }

  async deleteBinLookup(bin: string): Promise<void> {
    const binLookup = await this.binLookupRepository.findOne({
      where: { bin }
    });

    if (!binLookup) {
      throw new NotFoundException(`BIN ${bin} not found`);
    }

    await this.binLookupRepository.remove(binLookup);
  }

  async searchBins(query: string): Promise<BinLookupResponseDto[]> {
    const binLookups = await this.binLookupRepository
      .createQueryBuilder('bin')
      .where('bin.bin LIKE :query OR bin.issuer_name LIKE :query OR bin.bank_name LIKE :query', {
        query: `%${query}%`
      })
      .getMany();

    return binLookups.map(bin => this.mapToResponseDto(bin));
  }

  async getBinsByNetwork(cardNetwork: CardNetwork): Promise<BinLookupResponseDto[]> {
    const binLookups = await this.binLookupRepository.find({
      where: { cardNetwork }
    });

    return binLookups.map(bin => this.mapToResponseDto(bin));
  }

  async getBinsByCountry(countryCode: string): Promise<BinLookupResponseDto[]> {
    const binLookups = await this.binLookupRepository.find({
      where: { countryCode }
    });

    return binLookups.map(bin => this.mapToResponseDto(bin));
  }

  async getBinsByCardType(cardType: string): Promise<BinLookupResponseDto[]> {
    const binLookups = await this.binLookupRepository.find({
      where: { cardType }
    });

    return binLookups.map(bin => this.mapToResponseDto(bin));
  }

  private mapToResponseDto(binLookup: BinLookup): BinLookupResponseDto {
    return {
      bin: binLookup.bin,
      cardNetwork: binLookup.cardNetwork,
      issuerName: binLookup.issuerName,
      cardType: binLookup.cardType,
      cardCategory: binLookup.cardCategory,
      countryCode: binLookup.countryCode,
      countryName: binLookup.countryName,
      bankName: binLookup.bankName,
      bankWebsite: binLookup.bankWebsite,
      bankPhone: binLookup.bankPhone,
      isPrepaid: binLookup.isPrepaid,
    };
  }
}
