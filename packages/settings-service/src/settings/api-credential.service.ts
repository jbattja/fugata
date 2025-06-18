import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiCredential, ApiCredentialStatus, ApiKey } from '../entities/api-credential.entity';

type ApiCredentialUpdateData = Partial<Omit<ApiCredential, 'id' | 'created' | 'updatedAt'>>;

@Injectable()
export class ApiCredentialService {
  constructor(
    @InjectRepository(ApiCredential)
    private apiCredentialRepository: Repository<ApiCredential>,
  ) {}

  async create(
    merchantId: string,
    name: string,
    apiKeys: ApiKey[],
    allowedIpRange?: string[],
    status: ApiCredentialStatus = ApiCredentialStatus.ACTIVE
  ): Promise<ApiCredential> {
    const apiCredential = this.apiCredentialRepository.create({
      merchantId,
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

    const apiCredential = this.apiCredentialRepository.create({
      merchantId,
      name,
      apiKeys: [newApiKey],
      allowedIpRange,
      status: ApiCredentialStatus.ACTIVE,
    });
    return this.apiCredentialRepository.save(apiCredential);
  }


  async findById(id: string): Promise<ApiCredential | null> {
    return this.apiCredentialRepository.findOne({ where: { id } });
  }

  async findByMerchantIdAndName(merchantId: string, name: string): Promise<ApiCredential | null> {
    return this.apiCredentialRepository.findOne({ where: { merchantId, name } });
  }


  async findByMerchantId(merchantId: string): Promise<ApiCredential[]> {
    return this.apiCredentialRepository.find({ where: { merchantId } });
  }

  async update(id: string, data: ApiCredentialUpdateData): Promise<ApiCredential | null> {
    await this.apiCredentialRepository.update(id, data);
    return this.apiCredentialRepository.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.apiCredentialRepository.delete(id);
  }

  async findAll(): Promise<ApiCredential[]> {
    return this.apiCredentialRepository.find();
  }

  async findByApiHash(apiHash: string): Promise<ApiCredential | null> {
    return this.apiCredentialRepository.findOne({
      where: {
        apiKeys: {
          apiHash: apiHash
        }
      }
    });
  }
} 