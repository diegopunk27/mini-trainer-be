import { ConfigService } from '@nestjs/config';
import { ConsoleEmailAdapter } from './adapters/console.adapter';
import { SmtpAdapter } from './adapters/smtp.adapter';
import { createEmailAdapter } from './email-adapter.factory';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({ sendMail: jest.fn() }),
}));

const configWith = (driver?: string): ConfigService =>
  ({
    get: jest.fn((key: string) => {
      if (key === 'EMAIL_DRIVER') {
        return driver;
      }
      return undefined;
    }),
  }) as unknown as ConfigService;

describe('createEmailAdapter', () => {
  it('defaults to the console adapter', () => {
    expect(createEmailAdapter(configWith())).toBeInstanceOf(ConsoleEmailAdapter);
  });

  it('selects the console adapter when EMAIL_DRIVER is console', () => {
    expect(createEmailAdapter(configWith('console'))).toBeInstanceOf(ConsoleEmailAdapter);
  });

  it('selects the SMTP adapter when EMAIL_DRIVER is smtp', () => {
    expect(createEmailAdapter(configWith('smtp'))).toBeInstanceOf(SmtpAdapter);
  });
});
