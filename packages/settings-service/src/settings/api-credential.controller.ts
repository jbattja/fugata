import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiCredentialService } from './api-credential.service';
import { ApiCredential, ApiCredentialStatus, ApiKey } from '../entities/api-credential.entity';

@Controller('api-credentials')
export class ApiCredentialController {
  constructor(private readonly apiCredentialService: ApiCredentialService) {}

  @Post()
  async create(
    @Body() data: {
      merchantId: string;
      name: string;
      apiKeys: ApiKey[];
      allowedIpRange?: string[];
      status?: ApiCredentialStatus;
    }
  ): Promise<ApiCredential> {
    return this.apiCredentialService.create(
      data.merchantId,
      data.name,
      data.apiKeys,
      data.allowedIpRange,
      data.status
    );
  }

  @Post('api-key')
  async createNewApiKey(
    @Body() data: {
      merchantId: string;
      name: string;
      apiKey: string;
      allowedIpRange?: string[];
    }
  ): Promise<ApiCredential> {
    return this.apiCredentialService.createNewApiKey(
      data.merchantId,
      data.name,
      data.apiKey,
      data.allowedIpRange
    );
  }


  @Get()
  async findAll(): Promise<ApiCredential[]> {
    return this.apiCredentialService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ApiCredential | null> {
    return this.apiCredentialService.findById(id);
  }

  @Get('merchant/:merchantId')
  async findByMerchantId(@Param('merchantId') merchantId: string): Promise<ApiCredential[]> {
    return this.apiCredentialService.findByMerchantId(merchantId);
  }

  @Get('hash/:apiHash')
  async findByApiHash(@Param('apiHash') apiHash: string): Promise<ApiCredential | null> {
    return this.apiCredentialService.findByApiHash(apiHash);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: Partial<Omit<ApiCredential, 'id' | 'created' | 'updatedAt'>>
  ): Promise<ApiCredential | null> {
    return this.apiCredentialService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.apiCredentialService.delete(id);
  }
} 