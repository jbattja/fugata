import { Global, Module } from '@nestjs/common';
import { PartnerCommunicatorClient } from '@fugata/shared';
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
      provide: PartnerCommunicatorClient,
      useFactory: (configService: ConfigService) => {
        return new PartnerCommunicatorClient(
          configService.get('PARTNER_COMMUNICATOR_URL', 'http://partner-communicator:3003')
        );
      },
      inject: [ConfigService],
    }
  ],
  exports: [PartnerCommunicatorClient],
})
export class PartnerCommunicatorModule {} 