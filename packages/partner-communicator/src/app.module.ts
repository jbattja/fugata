import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ServiceAuthGuard } from '@fugata/shared';
import { PartnerCommunicationModule } from './partner-communication/partner-communication.module';
import { MissingFieldsErrorFilter } from './partner-communication/exceptions/missing-fields-error.filter';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PartnerCommunicationModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: MissingFieldsErrorFilter,
        },
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