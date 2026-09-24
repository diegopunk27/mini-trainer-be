import { ColumnNumericTransformer } from './column-numeric.transformer';

describe('ColumnNumericTransformer', () => {
  const transformer = new ColumnNumericTransformer();

  it('parses numeric strings coming from Postgres', () => {
    expect(transformer.from('10.50')).toBe(10.5);
    expect(transformer.from(10.5)).toBe(10.5);
  });

  it('returns null for empty values', () => {
    expect(transformer.from(null)).toBeNull();
    expect(transformer.from('')).toBeNull();
  });
});
