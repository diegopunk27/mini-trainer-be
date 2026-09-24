import { ConfigService } from '@nestjs/config';
import { ConsoleEmailAdapter } from './adapters/console.adapter';
import { SmtpAdapter } from './adapters/smtp.adapter';
import { EmailAdapter } from './interfaces/email-adapter.interface';

export const EMAIL_ADAPTER = Symbol('EMAIL_ADAPTER');

export const createEmailAdapter = (configService: ConfigService): EmailAdapter => {
  const driver = configService.get<string>('EMAIL_DRIVER') ?? 'console';
  if (driver === 'smtp') {
    return new SmtpAdapter(configService);
  }
  return new ConsoleEmailAdapter();
};
