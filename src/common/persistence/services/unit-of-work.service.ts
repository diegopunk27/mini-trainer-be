import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ClsService } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { isRetryablePostgresError, TX_KEY } from '../constants/transaction.constant';
import { ITransactionalEvent } from '../cqrs/transactional-event.interface';

export interface WithTransactionOptions {
  retries?: number;
}

/**
 * Opens a TypeORM transaction, stores the transactional EntityManager in CLS,
 * and optionally injects it into the provided commands for backward compatibility.
 *
 * Concurrent requests no longer share a repository-instance manager: each async
 * context reads `TX_KEY` independently. Nested calls reuse the open transaction.
 */
@Injectable()
export class UnitOfWorkService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly cls: ClsService,
  ) {}

  get getEntityManager(): EntityManager {
    return this.entityManager;
  }

  async withTransaction<T>(callback: () => Promise<T>, options?: WithTransactionOptions): Promise<T>;
  async withTransaction<T>(
    callback: () => Promise<T>,
    commands: ITransactionalEvent[],
    options?: WithTransactionOptions,
  ): Promise<T>;
  async withTransaction<T>(
    callback: () => Promise<T>,
    commandsOrOptions: ITransactionalEvent[] | WithTransactionOptions = {},
    options?: WithTransactionOptions,
  ): Promise<T> {
    const commands = Array.isArray(commandsOrOptions) ? commandsOrOptions : [];
    const retries = Array.isArray(commandsOrOptions) ? (options?.retries ?? 0) : (commandsOrOptions.retries ?? 0);

    const existing = this.getActiveTransactionManager();
    if (existing) {
      this.setEntityManagerIntoCommands(commands, existing);
      return callback();
    }

    return this.executeWithRetries(() => this.openTransaction(callback, commands), retries);
  }

  setEntityManagerIntoCommands(commands: ITransactionalEvent[], entityManagerTransaction: EntityManager): void {
    commands.forEach((command) => {
      command.entityManager = entityManagerTransaction;
    });
  }

  private getActiveTransactionManager(): EntityManager | undefined {
    if (!this.cls.isActive()) {
      return undefined;
    }

    return this.cls.get<EntityManager>(TX_KEY);
  }

  private async openTransaction<T>(callback: () => Promise<T>, commands: ITransactionalEvent[]): Promise<T> {
    const run = async (): Promise<T> =>
      this.entityManager.transaction(async (entityManagerTransaction) => {
        const previous = this.cls.get<EntityManager>(TX_KEY);
        this.cls.set(TX_KEY, entityManagerTransaction);
        this.setEntityManagerIntoCommands(commands, entityManagerTransaction);

        try {
          return await callback();
        } finally {
          this.cls.set(TX_KEY, previous);
        }
      });

    if (this.cls.isActive()) {
      return run();
    }

    return this.cls.run(run);
  }

  private async executeWithRetries<T>(operation: () => Promise<T>, retries: number): Promise<T> {
    let attempt = 0;

    for (;;) {
      try {
        return await operation();
      } catch (error) {
        if (!isRetryablePostgresError(error) || attempt >= retries) {
          throw error;
        }

        attempt += 1;
      }
    }
  }
}
