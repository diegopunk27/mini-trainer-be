import { Injectable, Logger } from '@nestjs/common';
import { EmailAdapter, EmailOptions } from '../interfaces/email-adapter.interface';

@Injectable()
export class ConsoleEmailAdapter implements EmailAdapter {
  private readonly logger = new Logger(ConsoleEmailAdapter.name);

  async sendEmail(options: EmailOptions): Promise<void> {
    this.logger.log(
      `Email (console) to=${options.to} subject="${options.subject}" from=${options.from ?? 'default'} replyTo=${options.replyTo ?? '-'}`,
    );
    if (options.html) {
      this.logger.debug(options.html);
      return;
    }
    if (options.text) {
      this.logger.debug(options.text);
    }
  }
}
