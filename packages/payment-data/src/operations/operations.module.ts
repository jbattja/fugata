import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationEntity } from '../entities/operation.entity';
import { OperationsService } from './operations.service';

@Module({
  imports: [TypeOrmModule.forFeature([OperationEntity])],
  providers: [OperationsService],
  exports: [OperationsService]
})
export class OperationsModule {}
