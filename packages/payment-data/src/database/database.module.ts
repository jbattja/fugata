import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentSessionEntity } from '../entities/payment-session.entity';
import { PaymentEventEntity } from '../entities/payment-event.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5433'),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [PaymentEntity, PaymentSessionEntity, PaymentEventEntity],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development'
    })
  ]
})
export class DatabaseModule {} 