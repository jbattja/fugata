import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Merchant } from '../entities/merchant.entity';
import { Provider } from '../entities/provider.entity';
import { ProviderCredential } from '../entities/provider-credential.entity';
import { RoutingRule } from '../entities/routing-rule.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('POSTGRES_USER', 'postgres'),
        password: configService.get('POSTGRES_PASSWORD', 'postgres'),
        database: configService.get('POSTGRES_DB', 'settings'),
        entities: [Merchant, Provider, ProviderCredential, RoutingRule, User],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {} 