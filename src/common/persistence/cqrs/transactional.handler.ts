import { EntityManager } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { BaseRepository } from '../repositories/base.repository';

/**
 * Write-handler base. The transactional EntityManager is resolved from CLS
 * by `BaseRepository.manager`; this class no longer mutates singleton repositories.
 */
export class TransactionalHandler {
  /**
   * @deprecated No-op. Repositories read the transaction manager from CLS.
   */
  injectEntityManager(_repositories: BaseRepository<BaseEntity>[], _session?: EntityManager): void {
    return;
  }

  /**
   * @deprecated No-op. Repositories read the transaction manager from CLS.
   */
  resetToOriginalEntityManager(_repositories: BaseRepository<BaseEntity>[]): void {
    return;
  }

  /**
   * @deprecated Pass-through kept so existing handlers keep the same call signature.
   * Open transactions with `UnitOfWorkService.withTransaction`.
   */
  async executeTransactionalCommand<T>(
    handlerToExecute: () => Promise<T>,
    _repositories: BaseRepository<BaseEntity>[] = [],
    _session?: EntityManager,
  ): Promise<T> {
    return handlerToExecute();
  }
}
