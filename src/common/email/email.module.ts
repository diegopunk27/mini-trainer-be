import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createEmailAdapter, EMAIL_ADAPTER } from './email-adapter.factory';
import { EmailService } from './services/email.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMAIL_ADAPTER,
      useFactory: createEmailAdapter,
      inject: [ConfigService],
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
