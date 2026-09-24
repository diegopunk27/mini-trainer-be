import { resolveJwtExpiresInSeconds } from './jwt-expires.helper';

describe('jwt-expires.helper', () => {
  it('defaults to 7 days when missing or invalid', () => {
    expect(resolveJwtExpiresInSeconds()).toBe(604800);
    expect(resolveJwtExpiresInSeconds('nope')).toBe(604800);
  });

  it('parses numeric seconds and duration suffixes', () => {
    expect(resolveJwtExpiresInSeconds('90')).toBe(90);
    expect(resolveJwtExpiresInSeconds('30s')).toBe(30);
    expect(resolveJwtExpiresInSeconds('2m')).toBe(120);
    expect(resolveJwtExpiresInSeconds('1h')).toBe(3600);
    expect(resolveJwtExpiresInSeconds('7d')).toBe(604800);
  });
});
