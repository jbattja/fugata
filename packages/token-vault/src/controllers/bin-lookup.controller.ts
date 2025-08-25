import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BinLookupService } from '../services/bin-lookup.service';
import { BinLookupResponseDto, CreateBinLookupDto } from '../dto/bin-lookup.dto';
import { CardNetwork } from '@fugata/shared';

@Controller('bin-lookup')
export class BinLookupController {
  constructor(private readonly binLookupService: BinLookupService) {}

  @Get(':bin')
  async lookupBin(@Param('bin') bin: string): Promise<BinLookupResponseDto> {
    return this.binLookupService.lookupBin(bin);
  }

  @Post()
  async createBinLookup(@Body() createBinLookupDto: CreateBinLookupDto): Promise<BinLookupResponseDto> {
    return this.binLookupService.createBinLookup(createBinLookupDto);
  }

  @Put(':bin')
  async updateBinLookup(
    @Param('bin') bin: string,
    @Body() updateData: Partial<CreateBinLookupDto>
  ): Promise<BinLookupResponseDto> {
    return this.binLookupService.updateBinLookup(bin, updateData);
  }

  @Delete(':bin')
  async deleteBinLookup(@Param('bin') bin: string): Promise<{ message: string }> {
    await this.binLookupService.deleteBinLookup(bin);
    return { message: 'BIN lookup deleted successfully' };
  }

  @Get('search')
  async searchBins(@Query('q') query: string): Promise<BinLookupResponseDto[]> {
    return this.binLookupService.searchBins(query);
  }

  @Get('network/:network')
  async getBinsByNetwork(@Param('network') network: CardNetwork): Promise<BinLookupResponseDto[]> {
    return this.binLookupService.getBinsByNetwork(network);
  }

  @Get('country/:countryCode')
  async getBinsByCountry(@Param('countryCode') countryCode: string): Promise<BinLookupResponseDto[]> {
    return this.binLookupService.getBinsByCountry(countryCode);
  }

  @Get('type/:cardType')
  async getBinsByCardType(@Param('cardType') cardType: string): Promise<BinLookupResponseDto[]> {
    return this.binLookupService.getBinsByCardType(cardType);
  }
}
