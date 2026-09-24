import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CqrsModule } from '@cqrs';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LogsModule } from '@logs/logs.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReadCacheModule } from './common/cache/read-cache.module';
import { TransactionsModule } from './common/transactions/transactional.module';
import { TypeOrmConfigService } from './config/typeorm-config.service';
import { EmailModule } from './common/email/email.module';
import { HealthModule } from './modules/health/health.module';
import { validateEnv } from './config/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [(): NodeJS.ProcessEnv => process.env],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    AuthModule,
    ReadCacheModule,
    TransactionsModule,
    EmailModule,
    HealthModule,
    CqrsModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    AppService,
  ],
  exports: [],
})
export class AppModule {}
