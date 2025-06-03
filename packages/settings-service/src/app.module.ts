import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SettingsModule } from './settings/settings.module';
import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { UniqueConstraintFilter } from './filters/unique-constraint.filter';

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
    },
  ],
})
export class AppModule {} 