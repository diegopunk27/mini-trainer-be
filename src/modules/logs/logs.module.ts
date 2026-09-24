import { Global, Module } from '@nestjs/common';
import { CreateLogCommandHandler } from './commands/create-log.handler';

@Global()
@Module({
  imports: [],
  providers: [CreateLogCommandHandler],
  exports: [],
})
export class LogsModule {}
