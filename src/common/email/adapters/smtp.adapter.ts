import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailAdapter, EmailOptions } from '../interfaces/email-adapter.interface';

@Injectable()
export class SmtpAdapter implements EmailAdapter {
  readonly transporter;
  private readonly logger = new Logger(SmtpAdapter.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.isSecure(),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  private isSecure(): boolean {
    const rawSecure = this.configService.get<string | boolean>('SMTP_SECURE');
    return rawSecure === true || rawSecure === 'true';
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: options.from ?? this.configService.get<string>('SMTP_FROM'),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
      });
      this.logger.log(`Email sent via SMTP. To: ${options.to}, Subject: "${options.subject}"`);
    } catch (error) {
      this.logger.error(
        `Error sending email via SMTP to ${options.to} with subject "${options.subject}". Error: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
