import { ClsServiceManager } from 'nestjs-cls';
import { EntityManager } from 'typeorm';

/**
 * CLS key for the transactional EntityManager of the current async context.
 * Repositories are singletons; the manager must never live on the instance.
 */
export const TX_KEY = 'TX_ENTITY_MANAGER';

export function getTransactionManager(): EntityManager | undefined {
  try {
    const cls = ClsServiceManager.getClsService();
    if (!cls.isActive()) {
      return undefined;
    }

    return cls.get<EntityManager>(TX_KEY);
  } catch {
    return undefined;
  }
}

export function isRetryablePostgresError(error: unknown): boolean {
  const code = getPostgresErrorCode(error);
  return code === '40P01' || code === '40001';
}

function getPostgresErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const candidate = error as { code?: unknown; driverError?: { code?: unknown } };
  if (typeof candidate.code === 'string') {
    return candidate.code;
  }

  if (typeof candidate.driverError?.code === 'string') {
    return candidate.driverError.code;
  }

  return undefined;
}
