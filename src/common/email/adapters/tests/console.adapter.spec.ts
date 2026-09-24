import { Logger } from '@nestjs/common';
import { ConsoleEmailAdapter } from '../console.adapter';

describe('ConsoleEmailAdapter', () => {
  let logSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    debugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    debugSpy.mockRestore();
  });

  it('logs html, replyTo and from without sending SMTP', async () => {
    const adapter = new ConsoleEmailAdapter();

    await adapter.sendEmail({
      to: 'to@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      replyTo: 'reply@example.com',
      from: 'from@example.com',
    });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('to=to@example.com'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('from=from@example.com'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('replyTo=reply@example.com'));
    expect(debugSpy).toHaveBeenCalledWith('<p>Hi</p>');
  });

  it('logs text when html is omitted', async () => {
    const adapter = new ConsoleEmailAdapter();

    await adapter.sendEmail({
      to: 'to@example.com',
      subject: 'Hello',
      text: 'Plain body',
    });

    expect(debugSpy).toHaveBeenCalledWith('Plain body');
  });
});
