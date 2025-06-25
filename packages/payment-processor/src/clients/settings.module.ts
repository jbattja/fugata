import { Global, Module } from '@nestjs/common';
import { SettingsClient } from '@fugata/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: SettingsClient,
      useFactory: (configService: ConfigService) => {
        return new SettingsClient(
          configService.get('SETTINGS_SERVICE_URL', 'http://settings-service:3000')
        );
      },
      inject: [ConfigService],
    }
  ],
  exports: [SettingsClient],
})
export class SettingsModule {} 