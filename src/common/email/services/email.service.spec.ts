import { Test, TestingModule } from '@nestjs/testing';
import { EMAIL_ADAPTER } from '../email-adapter.factory';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let adapter: { sendEmail: jest.Mock };

  beforeEach(async () => {
    adapter = { sendEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: EMAIL_ADAPTER,
          useValue: adapter,
        },
      ],
    }).compile();

    service = module.get(EmailService);
  });

  it('delegates to the injected adapter', async () => {
    const options = { to: 'to@example.com', subject: 'Hi', text: 'Body' };
    await service.sendEmail(options);
    expect(adapter.sendEmail).toHaveBeenCalledWith(options);
  });

  it('wraps adapter failures', async () => {
    adapter.sendEmail.mockRejectedValue(new Error('boom'));
    await expect(service.sendEmail({ to: 'to@example.com', subject: 'Hi' })).rejects.toThrow(
      'Error sending email boom',
    );
  });
});
