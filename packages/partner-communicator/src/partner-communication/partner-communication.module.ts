import { Module } from '@nestjs/common';
import { PartnerCommunicationController } from './partner-communication.controller';
import { PartnerCommunicationService } from './partner-communication.service';
import { PartnerRegistryService } from './partner-registry.service';

@Module({
  controllers: [PartnerCommunicationController],
  providers: [PartnerCommunicationService, PartnerRegistryService],
  exports: [PartnerCommunicationService],
})
export class PartnerCommunicationModule {} 