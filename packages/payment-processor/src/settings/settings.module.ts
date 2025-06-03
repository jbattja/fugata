import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SettingsClient } from '@fugata/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: SettingsClient,
      useFactory: (httpService: HttpService, configService: ConfigService) => {
        return new SettingsClient(
          httpService,
          configService.get('SETTINGS_SERVICE_URL', 'http://settings-service:3000')
        );
      },
      inject: [HttpService, ConfigService],
    },
  ],
  exports: [SettingsClient],
})
export class SettingsModule {} 