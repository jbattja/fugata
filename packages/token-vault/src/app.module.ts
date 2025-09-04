import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServiceAuthGuard } from '@fugata/shared';
import { DatabaseModule } from './database/database.module';
import { TokenVaultModule } from './token-vault/token-vault.module';
import { BinLookupModule } from './bin-lookup/bin-lookup.module';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        TokenVaultModule,
        BinLookupModule,
    ],
    providers: [
        {
            provide: 'JWT_SECRET',
            useValue: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        },
        {
            provide: APP_GUARD,
            useFactory: (jwtSecret: string) => new ServiceAuthGuard(jwtSecret),
            inject: ['JWT_SECRET'],
        }
    ],
})
export class AppModule { }
