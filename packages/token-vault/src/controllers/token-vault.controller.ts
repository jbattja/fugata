import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { TokenVaultService } from '../services/token-vault.service';
import { CreateCardTokenDto, TokenResponseDto, DecryptTokenDto, DecryptedCardDataDto } from '../dto/create-token.dto';
import { SharedLogger } from '@fugata/shared';

@Controller('token-vault')
export class TokenVaultController {
  constructor(private readonly tokenVaultService: TokenVaultService) {}

  @Post('tokens')
  async createToken(@Body() createTokenDto: CreateCardTokenDto): Promise<TokenResponseDto> {
    SharedLogger.log('Creating token', undefined, TokenVaultController.name);
    return this.tokenVaultService.createToken(createTokenDto);
  }

  @Get('tokens/:token')
  async getToken(
    @Param('token') token: string,
    @Query('merchantId') merchantId: string
  ): Promise<TokenResponseDto> {
    return this.tokenVaultService.getToken(token, merchantId);
  }

  @Post('tokens/:token/decrypt')
  async decryptToken(@Body() decryptTokenDto: DecryptTokenDto): Promise<DecryptedCardDataDto> {
    return this.tokenVaultService.decryptToken(decryptTokenDto.token, decryptTokenDto.merchantId);
  }

  @Delete('tokens/:token')
  async deactivateToken(
    @Param('token') token: string,
    @Query('merchantId') merchantId: string
  ): Promise<{ message: string }> {
    await this.tokenVaultService.deactivateToken(token, merchantId);
    return { message: 'Token deactivated successfully' };
  }

  @Get('customers/:customerId/tokens')
  async getTokensByCustomer(
    @Param('customerId') customerId: string,
    @Query('merchantId') merchantId: string
  ): Promise<TokenResponseDto[]> {
    return this.tokenVaultService.getTokensByCustomer(customerId, merchantId);
  }

  @Get('merchants/:merchantId/tokens')
  async getTokensByMerchant(
    @Param('merchantId') merchantId: string
  ): Promise<TokenResponseDto[]> {
    return this.tokenVaultService.getTokensByMerchant(merchantId);
  }
}
