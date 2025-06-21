import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiCredential, ApiCredentialStatus, ApiKey } from '../entities/api-credential.entity';
import { Merchant } from '../entities/merchant.entity';

type ApiCredentialUpdateData = Partial<Omit<ApiCredential, 'id' | 'created' | 'updatedAt'>>;

@Injectable()
export class ApiCredentialService {
  constructor(
    @InjectRepository(ApiCredential)
    private apiCredentialRepository: Repository<ApiCredential>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  async create(
    merchantId: string,
    name: string,
    apiKeys: ApiKey[],
    allowedIpRange?: string[],
    status: ApiCredentialStatus = ApiCredentialStatus.ACTIVE
  ): Promise<ApiCredential> {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }
    const apiCredential = this.apiCredentialRepository.create({
      merchant,
      name,
      apiKeys,
      allowedIpRange,
      status,
    });
    return this.apiCredentialRepository.save(apiCredential);
  }

  async createNewApiKey(
    merchantId: string,
    name: string,
    apiKey: string,
    allowedIpRange?: string[]
  ): Promise<ApiCredential> {
    const apiHash = require('crypto').createHash('sha256').update(apiKey).digest('hex');

    const newApiKey = {
      apiHash: apiHash,
      expiryDate: null
    };
    return this.create(merchantId, name, [newApiKey], allowedIpRange, ApiCredentialStatus.ACTIVE);
  }

  async findById(id: string): Promise<ApiCredential | null> {
    return this.apiCredentialRepository.findOne({ where: { id }, relations: ['merchant'] });
  }

  async findByMerchantIdAndName(merchantId: string, name: string): Promise<ApiCredential | null> {
    return this.apiCredentialRepository.findOne({ where: { merchant: { id: merchantId }, name }, relations: ['merchant'] });
  }


  async findByMerchantId(merchantId: string): Promise<ApiCredential[]> {
    return this.apiCredentialRepository.find({ where: { merchant: { id: merchantId } }, relations: ['merchant'] });
  }

  async update(id: string, data: ApiCredentialUpdateData): Promise<ApiCredential | null> {
    await this.apiCredentialRepository.update(id, data);
    return this.apiCredentialRepository.findOne({ where: { id }, relations: ['merchant'] });
  }

  async delete(id: string): Promise<void> {
    await this.apiCredentialRepository.delete(id);
  }

  async findAll(): Promise<ApiCredential[]> {
    return this.apiCredentialRepository.find({ relations: ['merchant'] });
  }

  async findByApiHash(apiHash: string): Promise<ApiCredential | null> {
    return this.apiCredentialRepository.findOne({
      where: {
        apiKeys: {
          apiHash: apiHash
        }
      },
      relations: ['merchant']
    });
  }
} 