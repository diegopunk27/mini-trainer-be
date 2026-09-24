import { EntityManager } from 'typeorm';

/**
 * Marker for commands/queries that participate in a UnitOfWork transaction.
 * `UnitOfWorkService.withTransaction` still injects `entityManager` into each event
 * for backward compatibility; repositories resolve the manager from CLS (`TX_KEY`).
 */
export interface ITransactionalEvent {
  entityManager?: EntityManager;
}
