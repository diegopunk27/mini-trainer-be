import { parseCorsOrigins } from './app.config';

describe('parseCorsOrigins', () => {
  it('builds an allowlist from a comma-separated CORS_ORIGINS value', () => {
    expect(parseCorsOrigins('http://localhost:3000, https://app.example.com ')).toEqual([
      'http://localhost:3000',
      'https://app.example.com',
    ]);
  });

  it('returns an empty list when CORS_ORIGINS is missing', () => {
    expect(parseCorsOrigins()).toEqual([]);
    expect(parseCorsOrigins('')).toEqual([]);
  });
});
