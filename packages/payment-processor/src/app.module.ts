import { Module, OnModuleInit, OnModuleDestroy, Global } from '@nestjs/common';
import { ValidationErrorFilter } from './filters/validation-error.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { PaymentsModule } from './payment/payment.module';
import { KafkaModule } from './kafka/kafka.module';
import { PaymentProducerService } from './kafka/payment-producer.service';
import { ServiceAuthGuard } from '@fugata/shared';
import { WorkflowOrchestrationModule } from './core/workflow-orchestration.module';
import { SettingsModule } from './clients/settings.module';
import { PartnerCommunicatorModule } from './clients/partner-communicator.module';
import { TokenVaultModule } from './clients/token-vault.module';

@Global()
@Module({
  imports: [
    KafkaModule,
    PaymentsModule,
    SettingsModule,
    PartnerCommunicatorModule,
    WorkflowOrchestrationModule, 
    TokenVaultModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationErrorFilter,
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
export class AppModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly paymentProducer: PaymentProducerService) {}

  async onModuleInit() {
    await this.paymentProducer.connect();
  }

  async onModuleDestroy() {
    await this.paymentProducer.disconnect();
  }
}
