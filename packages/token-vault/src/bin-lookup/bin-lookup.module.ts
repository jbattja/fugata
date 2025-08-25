import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BinLookup } from '../entities/bin-lookup.entity';
import { BinLookupService } from '../services/bin-lookup.service';
import { BinLookupController } from '../controllers/bin-lookup.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BinLookup])],
  controllers: [BinLookupController],
  providers: [BinLookupService],
  exports: [BinLookupService],
})
export class BinLookupModule {}
