import { Module } from '@nestjs/common';
import { ReadCacheModule } from './cache/read-cache.module';
import { TransactionsModule } from './transactions/transactional.module';

@Module({
  imports: [ReadCacheModule, TransactionsModule],
  exports: [ReadCacheModule, TransactionsModule],
})
export class CommonModule {}
