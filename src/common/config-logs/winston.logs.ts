import * as winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const isProduction = process.env.NODE_ENV === 'production';

const resolveLevel = (): string => {
  return process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug');
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = isProduction
  ? winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json())
  : winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
    );
const transports = [new winston.transports.Console()];

// eslint-disable-next-line @typescript-eslint/naming-convention
const Logger = winston.createLogger({
  level: resolveLevel(),
  levels,
  format,
  transports,
});

export default Logger;
