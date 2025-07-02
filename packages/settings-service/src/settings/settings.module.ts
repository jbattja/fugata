import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Merchant } from '../entities/merchant.entity';
import { ProviderCredential } from '../entities/provider-credential.entity';
import { RoutingRule } from '../entities/routing-rule.entity';
import { Provider } from 'src/entities/provider.entity';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ApiCredential } from '../entities/api-credential.entity';
import { ApiCredentialService } from './api-credential.service';
import { ApiCredentialController } from './api-credential.controller';
import { PaymentConfiguration } from '../entities/payment-configuration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant, Provider, ProviderCredential, RoutingRule, User, ApiCredential, PaymentConfiguration]),
  ],
  providers: [SettingsService, UserService, ApiCredentialService],
  controllers: [SettingsController, UserController, ApiCredentialController],
  exports: [SettingsService, UserService, ApiCredentialService],
})
export class SettingsModule {} 