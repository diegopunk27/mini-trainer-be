import type { MatcherFunction } from 'expect';

const toBeTypeOrNull: MatcherFunction<[classTypeOrNull: unknown]> = function (received, classTypeOrNull) {
  try {
    expect(received).toEqual(expect.any(classTypeOrNull));
    return { message: () => 'Ok', pass: true };
  } catch (_error) {
    if (received === null) {
      return { message: () => 'Ok', pass: true };
    }
    return {
      message: () => `expected ${String(received)} to be ${String(classTypeOrNull)} type or null`,
      pass: false,
    };
  }
};

expect.extend({
  toBeTypeOrNull,
});

declare module 'expect' {
  interface AsymmetricMatchers {
    toBeTypeOrNull(classTypeOrNull: unknown): boolean;
  }
  interface Matchers<R> {
    toBeTypeOrNull(classTypeOrNull: unknown): R;
  }
}
