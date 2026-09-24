import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule, ClsService } from 'nestjs-cls';
import { EntityManager } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { BaseRepository } from '../repositories/base.repository';
import { TransactionalHandler } from '../cqrs/transactional.handler';
import { UnitOfWorkService } from '../services/unit-of-work.service';

class TestEntity extends BaseEntity {}

type MarkedManager = EntityManager & { txId: string };

function createMarkedManager(txId: string): MarkedManager {
  return { txId } as MarkedManager;
}

function createBarrier(size: number): { wait: () => Promise<void> } {
  let arrived = 0;
  const waiters: (() => void)[] = [];

  return {
    async wait(): Promise<void> {
      arrived += 1;
      if (arrived >= size) {
        waiters.forEach((resolve) => {
          resolve();
        });
        return;
      }

      await new Promise<void>((resolve) => {
        waiters.push(resolve);
      });
    },
  };
}

class ConcurrentWriteHandler extends TransactionalHandler {
  constructor(private readonly repository: BaseRepository<TestEntity>) {
    super();
  }

  async execute(onInside: (manager: EntityManager) => Promise<void>): Promise<EntityManager> {
    return this.executeTransactionalCommand(async () => {
      await onInside(this.repository.manager);
      return this.repository.manager;
    }, [this.repository]);
  }
}

describe('Transaction concurrency (CLS)', () => {
  let moduleRef: TestingModule;
  let unitOfWork: UnitOfWorkService;
  let repository: BaseRepository<TestEntity>;
  let defaultManager: MarkedManager;
  let rootManager: EntityManager;
  let nextTxId: number;

  beforeEach(async () => {
    nextTxId = 0;
    defaultManager = createMarkedManager('default');

    rootManager = {
      transaction: jest.fn(async (callback: (manager: EntityManager) => Promise<unknown>) => {
        nextTxId += 1;
        const txManager = createMarkedManager(`tx-${nextTxId}`);
        return callback(txManager);
      }),
    } as unknown as EntityManager;

    moduleRef = await Test.createTestingModule({
      imports: [ClsModule.forRoot({ global: true })],
    }).compile();

    const cls = moduleRef.get(ClsService);
    unitOfWork = new UnitOfWorkService(rootManager, cls);
    repository = new BaseRepository(TestEntity, defaultManager);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('isolates two parallel transactional commands on the same repository (one rolls back)', async () => {
    const barrier = createBarrier(2);
    const handler = new ConcurrentWriteHandler(repository);
    const seen: { rollback?: string; commit?: string } = {};

    const rollbackCommand = unitOfWork.withTransaction(async () =>
      handler.execute(async (manager) => {
        seen.rollback = (manager as MarkedManager).txId;
        await barrier.wait();
        expect((repository.manager as MarkedManager).txId).toBe(seen.rollback);
        throw new Error('rollback');
      }),
    );

    const commitCommand = unitOfWork.withTransaction(async () =>
      handler.execute(async (manager) => {
        seen.commit = (manager as MarkedManager).txId;
        await barrier.wait();
        expect((repository.manager as MarkedManager).txId).toBe(seen.commit);
      }),
    );

    const [rolledBack, committed] = await Promise.allSettled([rollbackCommand, commitCommand]);

    expect(rolledBack.status).toBe('rejected');
    expect(committed.status).toBe('fulfilled');
    expect(seen.rollback).toBeDefined();
    expect(seen.commit).toBeDefined();
    expect(seen.rollback).not.toBe(seen.commit);
    expect((repository.manager as MarkedManager).txId).toBe('default');
    expect(rootManager.transaction).toHaveBeenCalledTimes(2);
  });

  it('reuses the open transaction on nested withTransaction', async () => {
    await unitOfWork.withTransaction(async () => {
      const outer = repository.manager as MarkedManager;

      await unitOfWork.withTransaction(async () => {
        expect((repository.manager as MarkedManager).txId).toBe(outer.txId);
      });

      expect((repository.manager as MarkedManager).txId).toBe(outer.txId);
    });

    expect(rootManager.transaction).toHaveBeenCalledTimes(1);
    expect((repository.manager as MarkedManager).txId).toBe('default');
  });

  it('retries on Postgres deadlock 40P01 and serialization failure 40001', async () => {
    const transaction = rootManager.transaction as jest.Mock;
    let attempts = 0;

    transaction.mockImplementation(async (callback: (manager: EntityManager) => Promise<unknown>) => {
      attempts += 1;
      if (attempts === 1) {
        const deadlock = Object.assign(new Error('deadlock'), { code: '40P01' });
        throw deadlock;
      }
      if (attempts === 2) {
        const serialization = Object.assign(new Error('serialization'), {
          driverError: { code: '40001' },
        });
        throw serialization;
      }

      return callback(createMarkedManager(`tx-${attempts}`));
    });

    const result = await unitOfWork.withTransaction(
      async () => {
        expect((repository.manager as MarkedManager).txId).toBe('tx-3');
        return 'ok';
      },
      { retries: 2 },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('keeps the current withTransaction(commands) API', async () => {
    const command = { entityManager: undefined as EntityManager | undefined };

    await unitOfWork.withTransaction(async () => {
      expect(command.entityManager).toBe(repository.manager);
    }, [command]);

    expect(command.entityManager).toBeDefined();
    expect((command.entityManager as MarkedManager).txId).toMatch(/^tx-/);
  });
});
