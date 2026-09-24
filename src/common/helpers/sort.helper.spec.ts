import { resolvePagination, resolveSort } from './sort.helper';

describe('sort.helper', () => {
  it('falls back when sortBy is not in the whitelist', () => {
    const sort = resolveSort('injected;drop', 'ASC', ['name', 'sku'], { column: 'name', order: 'DESC' });
    expect(sort.column).toBe('name');
    expect(sort.order).toBe('ASC');
  });

  it('caps limit at 100', () => {
    expect(resolvePagination(2, 500)).toEqual({ page: 2, limit: 100 });
    expect(resolvePagination(undefined, undefined)).toEqual({ page: 1, limit: 10 });
  });
});
