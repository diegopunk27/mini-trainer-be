import { validateEnv } from './env.schema';

const validEnv = (): Record<string, unknown> => ({
  PORT: '4000',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USERNAME: 'postgres',
  DB_PASSWORD: 'secret',
  DB_DATABASE: 'app_testing',
  JWT_SECRET: 'test_jwt_secret',
  JWT_ISSUER: 'test_app',
  JWT_AUDIENCE: 'test_audience',
  JWT_EXPIRES_IN: '1h',
  CORS_ORIGINS: 'http://localhost:3000',
});

describe('validateEnv', () => {
  it('accepts a complete test environment', () => {
    expect(validateEnv(validEnv())).toMatchObject({
      PORT: '4000',
      DB_DATABASE: 'app_testing',
      CORS_ORIGINS: 'http://localhost:3000',
    });
  });

  it('fails fast when a required variable is missing', () => {
    const incomplete = { ...validEnv() };
    delete incomplete.JWT_SECRET;

    expect(() => validateEnv(incomplete)).toThrow(/Invalid environment variables/);
    expect(() => validateEnv(incomplete)).toThrow(/JWT_SECRET/);
  });

  it('keeps unknown keys so extra env vars still reach ConfigService', () => {
    expect(validateEnv({ ...validEnv(), CUSTOM_FLAG: 'yes' })).toMatchObject({
      CUSTOM_FLAG: 'yes',
    });
  });

  it('rejects an invalid EMAIL_DRIVER', () => {
    expect(() => validateEnv({ ...validEnv(), EMAIL_DRIVER: 'mailgun' })).toThrow(/EMAIL_DRIVER/);
  });
});
