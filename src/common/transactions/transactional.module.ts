import { Global, Module } from '@nestjs/common';
import { UnitOfWorkService } from '@persistence/index';
import { ClsModule } from 'nestjs-cls';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [UnitOfWorkService],
  exports: [UnitOfWorkService],
  controllers: [],
})
export class TransactionsModule {}
