import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../entities/merchant.entity';
import { ProviderCredential } from '../entities/provider-credential.entity';
import { RoutingRule } from '../entities/routing-rule.entity';
import { Provider } from 'src/entities/provider.entity';
import { PaymentConfiguration } from 'src/entities/payment-configuration.entity';
import { Account, AccountStatus, AccountType, PaymentMethod, validateAccountSettings, validateAndDeduplicateProviderCredential } from '@fugata/shared';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(PaymentConfiguration)
    private readonly paymentConfigurationRepository: Repository<PaymentConfiguration>,
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(ProviderCredential)
    private readonly providerCredentialRepository: Repository<ProviderCredential>,
    @InjectRepository(RoutingRule)
    private readonly routingRuleRepository: Repository<RoutingRule>,
  ) {}

  // Merchant CRUD operations
  async createMerchant(accountCode: string, description?: string, status?: AccountStatus, settings?: Record<string, any>): Promise<Merchant> {
    const merchant = this.merchantRepository.create({
      accountCode: accountCode,
      description: description,
      status: status ? status : AccountStatus.ACTIVE,
      settings: settings,
    });
    await this.validateSettings(merchant, AccountType.MERCHANT);
    const paymentConfiguration = this.paymentConfigurationRepository.create({
      merchant: merchant,
      name: 'Default',
      isDefault: true,
    });
    merchant.paymentConfigurations = [paymentConfiguration];
    await this.paymentConfigurationRepository.save(paymentConfiguration);
    return this.merchantRepository.save(merchant);
  }

  async getMerchant(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: id },
      relations: ['paymentConfigurations'],
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${id} not found`);
    }
    return merchant;
  }

  async getMerchantByAccountCode(accountCode: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { accountCode: accountCode },
      relations: ['paymentConfigurations'],
    });
    if (!merchant) {
      throw new NotFoundException(`Merchant ${accountCode} not found`);
    }
    return merchant;
  }

  async getAllMerchants(filters?: {
    merchantIds?: string[];
  }): Promise<Merchant[]> {
    const queryBuilder = this.merchantRepository.createQueryBuilder('m')
      .leftJoinAndSelect('m.paymentConfigurations', 'pc');

    if (filters?.merchantIds) {
      queryBuilder.andWhere('m.id IN (:...merchantIds)', { merchantIds: filters.merchantIds });
    }
    return queryBuilder.getMany();
  }

  async updateMerchant(id: string, updates: Partial<Merchant>): Promise<Merchant> {
    const merchant = await this.getMerchant(id);
    Object.assign(merchant, updates);
    await this.validateSettings(merchant, AccountType.MERCHANT);
    return this.merchantRepository.save(merchant);
  }

  async deleteMerchant(id: string): Promise<void> {
    const merchant = await this.getMerchant(id);
    await this.merchantRepository.remove(merchant);
  }

    // Provider CRUD operations
    async createProvider(accountCode: string, description?: string, status?: AccountStatus, settings?: Record<string, any>): Promise<Provider> {
      const provider = this.providerRepository.create({
        accountCode: accountCode,
        description: description,
        status: status ? status : AccountStatus.ACTIVE,
        settings: settings,
      });
      await this.validateSettings(provider, AccountType.PROVIDER);
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

    async getProviderByAccountCode(accountCode: string): Promise<Provider> {
      const provider = await this.providerRepository.findOne({
        where: { accountCode: accountCode },
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
      await this.validateSettings(provider, AccountType.PROVIDER);
      return this.providerRepository.save(provider);
    }
  
    async deleteProvider(id: string): Promise<void> {
      const provider = await this.getProvider(id);
      await this.providerRepository.remove(provider);
    }
  
  // ProviderCredentials CRUD operations
  async createProviderCredential(
      accountCode: string, 
      providerCode: string, 
      description?: string,
      status?: AccountStatus,
      settings?: Record<string, any>): 
    Promise<ProviderCredential> {
    const provider = await this.getProviderByAccountCode(providerCode);
    if (!provider) {
      throw new NotFoundException(`Provider ${providerCode} not found`);
    }
    const providerCredential = this.providerCredentialRepository.create({
      accountCode: accountCode,
      description: description,
      status: status ? status : AccountStatus.ACTIVE,
      settings: settings,
      provider: provider,
    });
    providerCredential.provider = provider;
    
    // Validate and deduplicate settings before saving
    const validatedAndDeduplicated = validateAndDeduplicateProviderCredential(providerCredential);
    
    return this.providerCredentialRepository.save(validatedAndDeduplicated);
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

  async getProviderCredentialByAccountCode(accountCode: string): Promise<ProviderCredential> {
    const providerCredential = await this.providerCredentialRepository.findOne({
      where: { accountCode: accountCode },
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
      queryBuilder.andWhere('provider.accountCode = :providerCode', { providerCode: filters.providerCode });
    }

    if (filters?.providerId) {
      queryBuilder.andWhere('pc.providerId = :providerId', { providerId: filters.providerId });
    }
    return queryBuilder.getMany();
  }

  async updateProviderCredential(id: string, updates: Partial<ProviderCredential>): Promise<ProviderCredential> {
    const providerCredential = await this.getProviderCredential(id);
    Object.assign(providerCredential, updates);
    
    // Validate and deduplicate settings before saving
    const validatedAndDeduplicated = validateAndDeduplicateProviderCredential(providerCredential);
    
    return this.providerCredentialRepository.save(validatedAndDeduplicated);
  }

  async deleteProviderCredential(id: string): Promise<void> {
    const providerCredential = await this.getProviderCredential(id);
    await this.providerCredentialRepository.remove(providerCredential);
  }

  async getProviderCredentialForMerchant(
    merchantId: string, 
    paymentMethod?: PaymentMethod
    ): Promise<ProviderCredential> {
    const merchant = await this.getMerchant(merchantId);
    if (!merchant) {
      throw new NotFoundException(`Merchant ${merchantId} not found`);
    }
    const paymentConfiguration = merchant.paymentConfigurations.find(pc => pc.isDefault);
    if (!paymentConfiguration) {
      throw new NotFoundException(`No payment configuration found for merchant ${merchantId}`);
    }
    // Get all routing rules for this merchant's default payment configuration, ordered by weight (highest first)
    const routingRules = await this.routingRuleRepository.find({
      where: { paymentConfigurationId: paymentConfiguration.id, paymentMethod: paymentMethod }, 
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
    return providerCredential;
  }

  async createRoutingRule(
    paymentConfigurationId: string,
    providerCredentialCode: string,
    paymentMethod: PaymentMethod | string,
    weight: number = 1.0,
  ): Promise<RoutingRule> {
    const paymentConfiguration = await this.paymentConfigurationRepository.findOne({
      where: { id: paymentConfigurationId },  
    });
    if (!paymentConfiguration) {
      throw new NotFoundException(`Payment configuration ${paymentConfigurationId} not found`);
    }
    const providerCredential = await this.getProviderCredentialByAccountCode(providerCredentialCode);
    if (!providerCredential) {
      throw new NotFoundException(`Provider credential ${providerCredentialCode} not found`);
    }

    // Convert empty string to null for "Any" payment method
    const normalizedPaymentMethod = paymentMethod === '' ? null : paymentMethod as PaymentMethod;

    const routingRule = this.routingRuleRepository.create({
      paymentConfigurationId: paymentConfiguration.id,
      providerCredentialId: providerCredential.id,
      paymentMethod: normalizedPaymentMethod,
      weight,
      isActive: true,
    });

    return this.routingRuleRepository.save(routingRule);
  }

  async getRoutingRule(routingRuleId: string): Promise<RoutingRule> {
    const routingRule = await this.routingRuleRepository.findOne({
      where: { id: routingRuleId },
      relations: ['paymentConfiguration', 'providerCredential'],
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

  async getRoutingRulesByConfiguration(paymentConfigurationId: string): Promise<RoutingRule[]> {
    return this.routingRuleRepository.find({
      where: { paymentConfigurationId: paymentConfigurationId },
      relations: ['providerCredential', 'providerCredential.provider'],
    });
  }

  async updateRoutingRule(
    routingRuleId: string,
    updates: Partial<RoutingRule> & { paymentMethod?: PaymentMethod | string },
  ): Promise<RoutingRule> {
    const routingRule = await this.routingRuleRepository.findOneBy({ id: routingRuleId });
    if (!routingRule) {
      throw new NotFoundException(`Routing rule ${routingRuleId} not found`);
    }
    
    // Convert empty string to null for "Any" payment method
    if (updates.paymentMethod === '' as any) {
      updates.paymentMethod = null;
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

  async validateSettings(account: Account, accountType: AccountType): Promise<void> {
    const settingValidationErrors = validateAccountSettings(account, accountType);
    if (settingValidationErrors.length > 0) {
      const formattedErrors = settingValidationErrors.map(error => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `${error.property}: ${constraints}`;
      }).join('\n');
      
      throw new BadRequestException({
        message: `Invalid settings for ${AccountType[accountType]} ${account.accountCode}`,
        errors: formattedErrors
      });
    }
  }

  async getPaymentConfigurationsByMerchantId(merchantId: string): Promise<PaymentConfiguration[]> {
    return this.paymentConfigurationRepository.find({
      where: { merchantId: merchantId },
    });
  }

  async createPaymentConfiguration(merchantId: string, name: string, isDefault: boolean): Promise<PaymentConfiguration> {
    const merchant = await this.getMerchant(merchantId);
    if (!merchant) {
      throw new NotFoundException(`Merchant ${merchantId} not found`);
    }
    
    // If this is being set as default, unset other defaults
    if (isDefault) {
      await this.paymentConfigurationRepository.update(
        { merchantId: merchantId, isDefault: true },
        { isDefault: false }
      );
    }
    
    const paymentConfiguration = this.paymentConfigurationRepository.create({
      merchant: merchant,
      name: name,
      isDefault: isDefault,
    });
    return this.paymentConfigurationRepository.save(paymentConfiguration);
  }

  async getPaymentConfiguration(id: string): Promise<PaymentConfiguration> {
    const paymentConfiguration = await this.paymentConfigurationRepository.findOne({
      where: { id: id },
      relations: ['merchant'],
    });
    if (!paymentConfiguration) {
      throw new NotFoundException(`Payment configuration ${id} not found`);
    }
    return paymentConfiguration;
  }

  async updatePaymentConfiguration(id: string, updates: Partial<PaymentConfiguration>): Promise<PaymentConfiguration> {
    const paymentConfiguration = await this.getPaymentConfiguration(id);
    
    // If this is being set as default, unset other defaults
    if (updates.isDefault === true) {
      await this.paymentConfigurationRepository
        .createQueryBuilder()
        .update(PaymentConfiguration)
        .set({ isDefault: false })
        .where('merchantId = :merchantId', { merchantId: paymentConfiguration.merchantId })
        .andWhere('isDefault = :isDefault', { isDefault: true })
        .andWhere('id != :id', { id: id })
        .execute();
    }
    
    Object.assign(paymentConfiguration, updates);
    return this.paymentConfigurationRepository.save(paymentConfiguration);
  }

  async deletePaymentConfiguration(id: string): Promise<void> {
    const paymentConfiguration = await this.getPaymentConfiguration(id);
    
    if (paymentConfiguration.isDefault) {
      throw new BadRequestException('Cannot delete the default payment configuration');
    }
    
    const result = await this.paymentConfigurationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Payment configuration ${id} not found`);
    }
  }
}