import { Controller, Get, Post, Put, Delete, Body, Param, Query, UsePipes, ValidationPipe, Req, UnauthorizedException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Merchant } from '../entities/merchant.entity';
import { Provider } from '../entities/provider.entity';
import { RoutingRule } from '../entities/routing-rule.entity';
import { ProviderCredential } from '../entities/provider-credential.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { CreateProviderCredentialDto } from './dto/create-provider-credential.dto';
import { CreateRoutingRuleDto } from './dto/create-routing-rule.dto';
import { GetProviderCredentialsDto } from './dto/get-provider-credentials.dto';
import { PaymentMethod } from '@fugata/shared';
import { CreatePaymentConfigurationDto } from './dto/create-payment-configuration.dto';
import { PaymentConfiguration } from '../entities/payment-configuration.entity';
import { getMerchantIds, isAdmin } from '@fugata/shared';

@Controller('settings')
@UsePipes(new ValidationPipe({ transform: true }))
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Merchant CRUD endpoints
  @Post('merchants')
  async createMerchant(@Body() createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    return this.settingsService.createMerchant(createMerchantDto.accountCode, createMerchantDto.description, createMerchantDto.status, createMerchantDto.settings,);
  }

  @Get('merchants')
  async getAllMerchants(@Req() req: Request): Promise<Merchant[]> {
    if (isAdmin(req)) {
      return this.settingsService.getAllMerchants();
    }
    const merchantIds = getMerchantIds(req);
    if (merchantIds.length === 0) {
      throw new UnauthorizedException('No merchant IDs found');
    }
    return this.settingsService.getAllMerchants({ merchantIds });
  }

  @Get('merchants/:id')
  async getMerchant(@Param('id') id: string): Promise<Merchant> {
    return this.settingsService.getMerchant(id);
  }

  @Put('merchants/:id')
  async updateMerchant(
    @Param('id') id: string,
    @Body() updates: Partial<Merchant>,
  ): Promise<Merchant> {
    return this.settingsService.updateMerchant(id, updates);
  }

  @Delete('merchants/:id')
  async deleteMerchant(@Param('id') id: string): Promise<void> {
    return this.settingsService.deleteMerchant(id);
  }

  // Provider CRUD endpoints
  @Post('providers')
  async createProvider(@Body() createProviderDto: CreateProviderDto): Promise<Provider> {
    return this.settingsService.createProvider(createProviderDto.accountCode, createProviderDto.description, createProviderDto.status, createProviderDto.settings);
  }

  @Get('providers')
  async getAllProviders(): Promise<Provider[]> {
    return this.settingsService.getAllProviders();
  }

  @Get('providers/:id')
  async getProvider(@Param('id') id: string): Promise<Provider> {
    return this.settingsService.getProvider(id);
  }

  @Put('providers/:id')
  async updateProvider(
    @Param('id') id: string,
    @Body() updates: Partial<Provider>,
  ): Promise<Provider> {
    return this.settingsService.updateProvider(id, updates);
  }

  @Delete('providers/:id')
  async deleteProvider(@Param('id') id: string): Promise<void> {
    return this.settingsService.deleteProvider(id);
  }

  // ProviderCredential CRUD endpoints
  @Post('provider-credentials')
  async createProviderCredential(@Body() createProviderCredentialDto: CreateProviderCredentialDto): Promise<ProviderCredential> {
    return this.settingsService.createProviderCredential(
      createProviderCredentialDto.accountCode,
      createProviderCredentialDto.providerCode,
      createProviderCredentialDto.description,
      createProviderCredentialDto.status,
      createProviderCredentialDto.settings, 
    );
  }

  @Get('provider-credentials')
  async getAllProviderCredentials(@Query() filters: GetProviderCredentialsDto): Promise<ProviderCredential[]> {
    return this.settingsService.getAllProviderCredentials(filters);
  }

  @Get('provider-credentials/:id')
  async getProviderCredential(@Param('id') id: string): Promise<ProviderCredential> {
    return this.settingsService.getProviderCredential(id);
  }

  @Put('provider-credentials/:id')
  async updateProviderCredential(
    @Param('id') id: string,
    @Body() updates: Partial<ProviderCredential>,
  ): Promise<ProviderCredential> {
    return this.settingsService.updateProviderCredential(id, updates);
  }

  @Delete('provider-credentials/:id')
  async deleteProviderCredential(@Param('id') id: string): Promise<void> {
    return this.settingsService.deleteProviderCredential(id);
  }

  // RoutingRule CRUD endpoints 
  @Post('routing-rules')
  async createRoutingRule(
    @Body() createRoutingRuleDto: CreateRoutingRuleDto,
  ): Promise<RoutingRule> {
    return this.settingsService.createRoutingRule(
      createRoutingRuleDto.paymentConfigurationId,
      createRoutingRuleDto.providerCredentialCode,
      createRoutingRuleDto.paymentMethod,
      createRoutingRuleDto.weight,
    );
  }

  @Get('routing-rules')
  async getAllRoutingRules(): Promise<RoutingRule[]> {
    return this.settingsService.getAllRoutingRules();
  }

  @Get('routing-rules/:id')
  async getRoutingRule(@Param('id') id: string): Promise<RoutingRule> {
    return this.settingsService.getRoutingRule(id);
  }

  @Put('routing-rules/:id')
  async updateRoutingRule(
    @Param('id') id: string,
    @Body() updates: Partial<RoutingRule>,
  ): Promise<RoutingRule> {
    return this.settingsService.updateRoutingRule(id, updates);
  }

  @Delete('routing-rules/:id')
  async deleteRoutingRule(@Param('id') id: string): Promise<void> {
    return this.settingsService.deleteRoutingRule(id);
  }
  
  @Get('get-credentials')
  async getProviderCredentialForMerchant(
    @Query('merchantId') merchantId: string,
    @Query('paymentMethod') paymentMethod: PaymentMethod,
  ): Promise<ProviderCredential> {
    const providerCredential = await this.settingsService.getProviderCredentialForMerchant(merchantId, paymentMethod);
    return providerCredential;
  }

  // Payment Configuration CRUD endpoints
  @Get('payment-configurations/:merchantId')
  async getPaymentConfigurationsByMerchantId(@Param('merchantId') merchantId: string): Promise<PaymentConfiguration[]> {
    return this.settingsService.getPaymentConfigurationsByMerchantId(merchantId);
  }

  @Post('payment-configurations')
  async createPaymentConfiguration(@Body() createPaymentConfigurationDto: CreatePaymentConfigurationDto): Promise<PaymentConfiguration> {
    return this.settingsService.createPaymentConfiguration(createPaymentConfigurationDto.merchantId, createPaymentConfigurationDto.name, createPaymentConfigurationDto.isDefault);
  }

  @Put('payment-configurations/:id')
  async updatePaymentConfiguration(
    @Param('id') id: string,
    @Body() updates: Partial<PaymentConfiguration>,
  ): Promise<PaymentConfiguration> {
    return this.settingsService.updatePaymentConfiguration(id, updates);
  }

  @Delete('payment-configurations/:id')
  async deletePaymentConfiguration(@Param('id') id: string): Promise<void> {
    return this.settingsService.deletePaymentConfiguration(id);
  }

  @Get('payment-configurations/:id')
  async getPaymentConfiguration(@Param('id') id: string): Promise<PaymentConfiguration> {
    return this.settingsService.getPaymentConfiguration(id);
  }

} 