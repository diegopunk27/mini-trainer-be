import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

interface JwtVerifyOptions {
  issuer?: string;
  audience?: string;
}

const createStrategy = (): JwtStrategy => {
  const values: Record<string, string> = {
    JWT_SECRET: 'test_jwt_secret',
    JWT_ISSUER: 'test_app',
    JWT_AUDIENCE: 'test_audience',
  };

  return new JwtStrategy({
    getOrThrow: jest.fn((key: string) => {
      if (!values[key]) {
        throw new Error(`Missing ${key}`);
      }
      return values[key];
    }),
  } as unknown as ConfigService);
};

describe('JwtStrategy', () => {
  it('validates issuer and audience from env', () => {
    const strategy = createStrategy();
    const verifyOpts = (strategy as unknown as { _verifOpts: JwtVerifyOptions })._verifOpts;

    expect(verifyOpts.issuer).toBe('test_app');
    expect(verifyOpts.audience).toBe('test_audience');
  });

  it('maps the JWT payload to UserDto including permissions', () => {
    const strategy = createStrategy();

    expect(
      strategy.validate({
        sub: 7,
        email: 'user@example.com',
        roleId: 2,
        roleName: 'EDITOR',
        permissions: ['example:read'],
      }),
    ).toEqual({
      id: 7,
      email: 'user@example.com',
      roleId: 2,
      roleName: 'EDITOR',
      permissions: ['example:read'],
    });
  });
});
