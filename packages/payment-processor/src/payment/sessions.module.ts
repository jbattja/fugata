import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';

@Module({
  controllers: [SessionsController],
  providers: [],
})
export class SessionsModule {} 