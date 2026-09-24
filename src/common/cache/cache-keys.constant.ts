export const CACHE_KEYS = {
  defaultPrefix: 'cache',
} as const;

export const CACHE_TTL_MS = {
  default: 15_000,
} as const;

export const buildCacheKey = (prefix: string, suffix: string): string => `${prefix}:${suffix}`;
