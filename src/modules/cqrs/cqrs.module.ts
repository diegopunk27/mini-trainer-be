import { Global, Module } from '@nestjs/common';
import { CqrsModule as NestjCqrsModule } from '@nestjs/cqrs';
import { CommandBus } from './buses/command-bus';
import { QueryBus } from './buses/query-bus';

@Global()
@Module({
  imports: [NestjCqrsModule],
  providers: [QueryBus, CommandBus],
  exports: [QueryBus, CommandBus],
})
export class CqrsModule {}
