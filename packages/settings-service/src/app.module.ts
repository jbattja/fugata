import { Module, ValidationPipe, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SettingsModule } from './settings/settings.module';
import { APP_PIPE, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { UniqueConstraintFilter } from './filters/unique-constraint.filter';
import { ServiceAuthGuard } from '@fugata/shared';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: UniqueConstraintFilter,
    },{
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
export class AppModule {} 