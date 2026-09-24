import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { SmtpAdapter } from '../smtp.adapter';
import { EmailOptions } from '@common/email/interfaces/email-adapter.interface';

jest.mock('nodemailer');

describe('SmtpAdapter', () => {
  let smtpAdapter: SmtpAdapter;
  let transporter: { sendMail: jest.Mock };

  beforeEach(async () => {
    transporter = {
      sendMail: jest.fn(),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(transporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmtpAdapter,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string | number | boolean> = {
                SMTP_HOST: 'smtp.example.com',
                SMTP_PORT: 587,
                SMTP_SECURE: false,
                SMTP_USER: 'user@example.com',
                SMTP_PASSWORD: 'password',
                SMTP_FROM: 'from@example.com',
              };
              return config[key] ?? null;
            }),
          },
        },
      ],
    }).compile();

    smtpAdapter = module.get<SmtpAdapter>(SmtpAdapter);
  });

  it('should be defined', () => {
    expect(smtpAdapter).toBeDefined();
  });

  it('does not disable TLS certificate verification', () => {
    const transportOptions = (nodemailer.createTransport as jest.Mock).mock.calls[0][0] as {
      tls?: { rejectUnauthorized?: boolean };
    };
    expect(transportOptions.tls?.rejectUnauthorized).not.toBe(false);
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const emailOptions: EmailOptions = {
        to: 'to@example.com',
        subject: 'Test Subject',
        text: 'Test Email Body',
        html: '<p>Test Email Body</p>',
        replyTo: 'reply@example.com',
        from: 'custom@example.com',
      };

      await smtpAdapter.sendEmail(emailOptions);

      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: emailOptions.from,
        to: emailOptions.to,
        subject: emailOptions.subject,
        text: emailOptions.text,
        html: emailOptions.html,
        replyTo: emailOptions.replyTo,
      });
      expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    });

    it('falls back to SMTP_FROM when from is omitted', async () => {
      await smtpAdapter.sendEmail({
        to: 'to@example.com',
        subject: 'Test Subject',
        text: 'Test Email Body',
      });

      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'from@example.com',
        }),
      );
    });

    it('should throw an error when sending email fails', async () => {
      const emailOptions: EmailOptions = {
        to: 'to@example.com',
        subject: 'Test Subject',
        text: 'Test Email Body',
      };

      transporter.sendMail.mockRejectedValue(new Error('Failed to send email'));

      await expect(smtpAdapter.sendEmail(emailOptions)).rejects.toThrow('Failed to send email');
      expect(transporter.sendMail).toHaveBeenCalledTimes(1);
    });
  });
});
