import { EntityManager } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { BaseRepository } from '../repositories/base.repository';

class TestEntity extends BaseEntity {}

describe('BaseRepository', () => {
  const createRepository = (): {
    repository: BaseRepository<TestEntity>;
    manager: {
      save: jest.Mock;
      softDelete: jest.Mock;
      delete: jest.Mock;
    };
  } => {
    const manager = {
      save: jest.fn(async (_entityClass: unknown, entities: TestEntity[]) => entities),
      softDelete: jest.fn(async () => ({ affected: 1 })),
      delete: jest.fn(async () => ({ affected: 1 })),
    };

    return {
      repository: new BaseRepository(TestEntity, manager as unknown as EntityManager),
      manager,
    };
  };

  it('saveManyEntities returns [] without calling save when empty', async () => {
    const { repository, manager } = createRepository();

    await expect(repository.saveManyEntities([])).resolves.toEqual([]);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('saveManyEntities delegates to manager.save', async () => {
    const { repository, manager } = createRepository();
    const entities = [{ id: 1 } as TestEntity];

    await expect(repository.saveManyEntities(entities)).resolves.toEqual(entities);
    expect(manager.save).toHaveBeenCalledWith(TestEntity, entities);
  });

  it('deleteById and softDeleteById use softDelete', async () => {
    const { repository, manager } = createRepository();

    await expect(repository.deleteById(1)).resolves.toBe(true);
    await expect(repository.softDeleteById(2)).resolves.toBe(true);
    expect(manager.softDelete).toHaveBeenCalledWith(TestEntity, 1);
    expect(manager.softDelete).toHaveBeenCalledWith(TestEntity, 2);
    expect(manager.delete).not.toHaveBeenCalled();
  });

  it('hardDeleteById uses physical delete', async () => {
    const { repository, manager } = createRepository();

    await expect(repository.hardDeleteById(3)).resolves.toBe(true);
    expect(manager.delete).toHaveBeenCalledWith(TestEntity, 3);
    expect(manager.softDelete).not.toHaveBeenCalled();
  });
});
