import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMAIL_ADAPTER } from '../email-adapter.factory';
import { EmailAdapter, EmailOptions } from '../interfaces/email-adapter.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(@Inject(EMAIL_ADAPTER) private readonly adapter: EmailAdapter) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.adapter.sendEmail(options);
    } catch (error) {
      this.logger.error(`Error sending email: ${(error as Error).message}`);
      throw new Error(`Error sending email ${(error as Error).message}`, { cause: error });
    }
  }
}
