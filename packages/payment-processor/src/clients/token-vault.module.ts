import { Global, Module } from '@nestjs/common';
import { TokenVaultClient } from '@fugata/shared';
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
      provide: TokenVaultClient,
      useFactory: (configService: ConfigService) => {
        return new TokenVaultClient(
          configService.get('TOKEN_VAULT_URL', 'http://localhost:3006')
        );
      },
      inject: [ConfigService],
    }
  ],
  exports: [TokenVaultClient],
})
export class TokenVaultModule {}
