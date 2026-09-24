import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface MemoryEntry {
  value: string;
  expiresAt: number;
}

/**
 * Read-through cache: Redis when REDIS_HOST is set, otherwise in-process memory.
 * Local/e2e do not need a sidecar; production can enable Redis via env.
 */
@Injectable()
export class ReadCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(ReadCacheService.name);
  private readonly memory = new Map<string, MemoryEntry>();
  private readonly redis?: Redis;

  constructor(configService: ConfigService) {
    const host = configService.get<string>('REDIS_HOST');
    if (!host) {
      return;
    }
    this.redis = new Redis({
      host,
      port: Number(configService.get<string>('REDIS_PORT') ?? 6379),
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    void this.redis.connect().catch((error: unknown) => {
      this.logger.warn(`Redis no disponible, se usa caché en memoria: ${String(error)}`);
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    if (this.redis?.status === 'ready') {
      const raw = await this.redis.get(key);
      return raw ? (JSON.parse(raw) as T) : undefined;
    }
    const entry = this.memory.get(key);
    if (!entry) {
      return undefined;
    }
    if (entry.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return undefined;
    }
    return JSON.parse(entry.value) as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (this.redis?.status === 'ready') {
      await this.redis.set(key, payload, 'PX', ttlMs);
      return;
    }
    this.memory.set(key, { value: payload, expiresAt: Date.now() + ttlMs });
  }

  async getOrSet<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const value = await factory();
    await this.set(key, value, ttlMs);
    return value;
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    if (this.redis?.status === 'ready') {
      const keys = await this.scanKeys(`${prefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
    for (const key of [...this.memory.keys()]) {
      if (key.startsWith(prefix)) {
        this.memory.delete(key);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      this.redis.disconnect();
    }
  }

  private async scanKeys(match: string): Promise<string[]> {
    if (!this.redis) {
      return [];
    }
    const found: string[] = [];
    let cursor = '0';
    do {
      const [next, keys] = await this.redis.scan(cursor, 'MATCH', match, 'COUNT', 100);
      cursor = next;
      found.push(...keys);
    } while (cursor !== '0');
    return found;
  }
}
