import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../entities/merchant.entity';
import { ProviderCredential } from '../entities/provider-credential.entity';
import { RoutingRule } from '../entities/routing-rule.entity';
import { Provider } from 'src/entities/provider.entity';
import { Account, AccountType, validateAccountSettings } from '@fugata/shared';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(ProviderCredential)
    private readonly providerCredentialRepository: Repository<ProviderCredential>,
    @InjectRepository(RoutingRule)
    private readonly routingRuleRepository: Repository<RoutingRule>,
  ) {}

  // Merchant CRUD operations
  async createMerchant(name: string, merchantCode: string, settings: Record<string, any>): Promise<Merchant> {
    const merchant = this.merchantRepository.create({
      name,
      merchantCode: merchantCode,
      settings: settings,
    });
    await this.validateSettings(merchant, AccountType.MERCHANT, merchant.name);
    return this.merchantRepository.save(merchant);
  }

  async getMerchant(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: id },
      relations: ['routingRules'],
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} not found`);
    }
    return merchant;
  }

  async getMerchantByMerchantCode(merchantCode: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { merchantCode: merchantCode },
      relations: ['routingRules'],
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${merchantCode} not found`);
    }
    return merchant;
  }


  async getAllMerchants(): Promise<Merchant[]> {
    return this.merchantRepository.find({
    });
  }

  async updateMerchant(id: string, updates: Partial<Merchant>): Promise<Merchant> {
    const merchant = await this.getMerchant(id);
    Object.assign(merchant, updates);
    await this.validateSettings(merchant, AccountType.MERCHANT, merchant.name);
    return this.merchantRepository.save(merchant);
  }

  async deleteMerchant(id: string): Promise<void> {
    const merchant = await this.getMerchant(id);
    await this.merchantRepository.remove(merchant);
  }

    // Provider CRUD operations
    async createProvider(name: string, providerCode: string, settings: Record<string, any>): Promise<Provider> {
      const provider = this.providerRepository.create({
        name,
        providerCode: providerCode,
        settings: settings,
      });
      await this.validateSettings(provider, AccountType.PROVIDER, name);
      return this.providerRepository.save(provider);
    }
  
    async getProvider(id: string): Promise<Provider> {
      const provider = await this.providerRepository.findOne({
        where: { id: id },
        relations: ['providerCredentials'],
      });
      if (!provider) {
        throw new NotFoundException(`Provider ${id} not found`);
      }
      return provider;
    }

    async getProviderByProviderCode(providerCode: string): Promise<Provider> {
      const provider = await this.providerRepository.findOne({
        where: { providerCode: providerCode },
        relations: ['providerCredentials'],
      });
      return provider;
    }
  
    async getAllProviders(): Promise<Provider[]> {
      return this.providerRepository.find({
      });
    }
  
    async updateProvider(id: string, updates: Partial<Provider>): Promise<Provider> {
      const provider = await this.getProvider(id);
      Object.assign(provider, updates);
      await this.validateSettings(provider, AccountType.PROVIDER, provider.name);
      return this.providerRepository.save(provider);
    }
  
    async deleteProvider(id: string): Promise<void> {
      const provider = await this.getProvider(id);
      await this.providerRepository.remove(provider);
    }
  
  // ProviderCredentials CRUD operations
  async createProviderCredential(
      providerCredentialCode: string, 
      providerCode: string, 
      settings: Record<string, any>,
      isActive: boolean): 
    Promise<ProviderCredential> {
    const provider = await this.getProviderByProviderCode(providerCode);
    if (!provider) {
      throw new NotFoundException(`Provider ${providerCode} not found`);
    }
    const providerCredential = this.providerCredentialRepository.create({
      providerCredentialCode: providerCredentialCode,
      providerId: provider.id,
      settings,
      isActive,
    });
    providerCredential.provider = provider;
    await this.validateSettings(providerCredential, AccountType.PROVIDER_CREDENTIAL, providerCredentialCode);
    return this.providerCredentialRepository.save(providerCredential);
  }

  async getProviderCredential(id: string): Promise<ProviderCredential> {
    const providerCredential = await this.providerCredentialRepository.findOne({
      where: { id: id },
      relations: ['provider'],
    });
    if (!providerCredential) {
      throw new NotFoundException(`Provider credential ${id} not found`);
    }
    return providerCredential;
  }

  async getProviderCredentialByProviderCredentialCode(providerCredentialCode: string): Promise<ProviderCredential> {
    const providerCredential = await this.providerCredentialRepository.findOne({
      where: { providerCredentialCode: providerCredentialCode },
      relations: ['provider'],
    });
    return providerCredential;
  }

  async getAllProviderCredentials(filters?: {
    providerCode?: string;
    providerId?: string;
  }): Promise<ProviderCredential[]> {
    const queryBuilder = this.providerCredentialRepository.createQueryBuilder('pc')
      .leftJoinAndSelect('pc.provider', 'provider')

    if (filters?.providerCode) {
      queryBuilder.andWhere('provider.providerCode = :providerCode', { providerCode: filters.providerCode });
    }

    if (filters?.providerId) {
      queryBuilder.andWhere('pc.providerId = :providerId', { providerId: filters.providerId });
    }

    return queryBuilder.getMany();
  }

  async updateProviderCredential(id: string, updates: Partial<ProviderCredential>): Promise<ProviderCredential> {
    const providerCredential = await this.getProviderCredential(id);
    Object.assign(providerCredential, updates);
    await this.validateSettings(providerCredential, AccountType.PROVIDER_CREDENTIAL, providerCredential.providerCredentialCode);
    return this.providerCredentialRepository.save(providerCredential);
  }

  async deleteProviderCredential(id: string): Promise<void> {
    const providerCredential = await this.getProviderCredential(id);
    await this.providerCredentialRepository.remove(providerCredential);
  }

  async getProviderCredentialForMerchant(
    merchantId: string, 
      conditions: Record<string, any>
    ): Promise<ProviderCredential> {
    const merchant = await this.getMerchant(merchantId);
    if (!merchant) {
      throw new NotFoundException(`Merchant ${merchantId} not found`);
    }
  
    // Get all routing rules for this merchant, ordered by weight (highest first)
    const routingRules = await this.routingRuleRepository.find({
      where: { merchantId: merchantId }, // Use the UUID id instead of merchantCode
      order: { weight: 'DESC' },
    });
    if (routingRules.length === 0) {
      throw new NotFoundException(`No routing rules found for merchant ${merchantId}`);
    }
    const providerCredential = await this.providerCredentialRepository.findOne({
      where: { id: routingRules[0].providerCredentialId },
      relations: ['provider'],
    });
    if (!providerCredential) {
      throw new NotFoundException(`Provider credential ${routingRules[0].providerCredentialId} not found`);
    }
    // TODO implement conditions evaluation
    return providerCredential;
  }

  async createRoutingRule(
    merchantCode: string,
    providerCredentialCode: string,
    conditions: Record<string, any>,
    weight: number = 1.0,
  ): Promise<RoutingRule> {
    const merchant = await this.getMerchantByMerchantCode(merchantCode);
    if (!merchant) {
      throw new NotFoundException(`Merchant ${merchantCode} not found`);
    }
    const providerCredential = await this.getProviderCredentialByProviderCredentialCode(providerCredentialCode);
    if (!providerCredential) {
      throw new NotFoundException(`Provider credential ${providerCredentialCode} not found`);
    }

    const routingRule = this.routingRuleRepository.create({
      merchantId: merchant.id,
      providerCredentialId: providerCredential.id,
      conditions,
      weight,
      isActive: true,
    });

    return this.routingRuleRepository.save(routingRule);
  }

  async getRoutingRule(routingRuleId: string): Promise<RoutingRule> {
    const routingRule = await this.routingRuleRepository.findOne({
      where: { id: routingRuleId },
      relations: ['merchant', 'providerCredential'],
     });
    if (!routingRule) {
      throw new NotFoundException(`Routing rule ${routingRuleId} not found`);
    }
    return routingRule;
  }

  async getAllRoutingRules(): Promise<RoutingRule[]> {
    return this.routingRuleRepository.find({
    });
  }

  async updateRoutingRule(
    routingRuleId: string,
    updates: Partial<RoutingRule>,
  ): Promise<RoutingRule> {
    const routingRule = await this.routingRuleRepository.findOneBy({ id: routingRuleId });
    if (!routingRule) {
      throw new NotFoundException(`Routing rule ${routingRuleId} not found`);
    }
    Object.assign(routingRule, updates);
    return this.routingRuleRepository.save(routingRule);
  }

  async deleteRoutingRule(routingRuleId: string): Promise<void> {
    const result = await this.routingRuleRepository.delete(routingRuleId);
    if (result.affected === 0) {
      throw new NotFoundException(`Routing rule ${routingRuleId} not found`);
    }
  }

  async validateSettings(account: Account, accountType: AccountType, accountName: string): Promise<void> {
    const settingValidationErrors = validateAccountSettings(account, accountType);
    if (settingValidationErrors.length > 0) {
      const formattedErrors = settingValidationErrors.map(error => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `${error.property}: ${constraints}`;
      }).join('\n');
      
      throw new BadRequestException({
        message: `Invalid settings for ${AccountType[accountType]} ${accountName}`,
        errors: formattedErrors
      });
    }
  }
} 