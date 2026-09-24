export interface EmailAdapter {
  sendEmail(options: EmailOptions): Promise<void>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  from?: string;
}
