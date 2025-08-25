import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardToken } from '../entities/card-token.entity';
import { TokenVaultService } from '../services/token-vault.service';
import { TokenVaultController } from '../controllers/token-vault.controller';
import { EncryptionService } from '../services/encryption.service';

@Module({
  imports: [TypeOrmModule.forFeature([CardToken])],
  controllers: [TokenVaultController],
  providers: [TokenVaultService, EncryptionService],
  exports: [TokenVaultService],
})
export class TokenVaultModule {}
