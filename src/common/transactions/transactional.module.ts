import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UnitOfWorkService } from '@persistence/index';
import { ClsModule } from 'nestjs-cls';
import { RequestContextInterceptor } from '../tenancy/request-context.interceptor';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [UnitOfWorkService, { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor }],
  exports: [UnitOfWorkService],
  controllers: [],
})
export class TransactionsModule {}
