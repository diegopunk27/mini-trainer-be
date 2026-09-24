import { ConfigService } from '@nestjs/config';
import { ReadCacheService } from './read-cache.service';

describe('ReadCacheService', () => {
  const createService = (): ReadCacheService => {
    const config = { get: (): undefined => undefined } as unknown as ConfigService;
    return new ReadCacheService(config);
  };

  it('devuelve el valor cacheado dentro del TTL', async () => {
    const cache = createService();
    const value = await cache.getOrSet('items:list', 5_000, async () => ({ total: 10 }));
    const cached = await cache.getOrSet('items:list', 5_000, async () => ({ total: 99 }));
    expect(value).toEqual({ total: 10 });
    expect(cached).toEqual({ total: 10 });
    await cache.onModuleDestroy();
  });

  it('invalida por prefijo', async () => {
    const cache = createService();
    await cache.set('items:list', { total: 1 }, 5_000);
    await cache.set('other:key', [{ id: 1 }], 5_000);
    await cache.invalidateByPrefix('items:');
    expect(await cache.get('items:list')).toBeUndefined();
    expect(await cache.get('other:key')).toEqual([{ id: 1 }]);
    await cache.onModuleDestroy();
  });
});
