import { Module } from '@nestjs/common';
import { SettingsClient } from '@fugata/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from './jwt.service';

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
    },
    {
      provide: JwtService,
      useFactory: (configService: ConfigService) => {
        return new JwtService(configService.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production'));
      },
      inject: [ConfigService],
    }
  ],
  exports: [SettingsClient, JwtService],
})
export class SettingsModule {} 