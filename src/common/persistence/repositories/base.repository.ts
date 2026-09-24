import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  In,
  SelectQueryBuilder,
} from 'typeorm';
import { getTransactionManager } from '../constants/transaction.constant';
import { BaseEntity } from '../entities/base.entity';
import { ListResponseDto } from '../entities/list-response.dto';

type EntityClass<T> = new () => T;

/**
 * Data-mapper repository bound to an EntityManager.
 * The transactional manager is read from CLS (`TX_KEY`), never stored on this singleton.
 */
export class BaseRepository<T extends BaseEntity> {
  private readonly classEntity: EntityClass<T>;
  protected repositoryEntityManager: EntityManager;

  constructor(classEntity: EntityClass<T>, repositoryEntityManager: EntityManager) {
    this.classEntity = classEntity;
    this.repositoryEntityManager = repositoryEntityManager;
  }

  get manager(): EntityManager {
    return getTransactionManager() ?? this.repositoryEntityManager;
  }

  /**
   * @deprecated Transaction managers live in CLS. This setter is a no-op kept for call-site compatibility.
   */
  set setActiveEntityManager(_entityManager: EntityManager) {
    return;
  }

  /**
   * @deprecated Transaction managers live in CLS. This reset is a no-op kept for call-site compatibility.
   */
  resetEntityManager(): void {
    return;
  }

  get getEntityManager(): EntityManager {
    return this.manager;
  }

  createQueryBuilder(alias = this.classEntity.name): SelectQueryBuilder<T> {
    return this.manager.createQueryBuilder(this.classEntity, alias);
  }

  async findAll(page = 1, limit = 10, options?: FindManyOptions<T>): Promise<ListResponseDto<T>> {
    const skip = (page - 1) * limit;
    const [entities, total] = await this.manager.findAndCount(this.classEntity, {
      skip,
      take: limit,
      ...options,
    });

    return { results: entities, count: total, page, limit };
  }

  async findAllWithoutPagination(options?: FindManyOptions<T>): Promise<T[]> {
    return this.manager.find(this.classEntity, options);
  }

  async findById(id: number, select?: FindOptionsSelect<T>, relations?: FindOptionsRelations<T>): Promise<T | null> {
    const options: FindOneOptions<T> = {
      where: { id } as FindOneOptions<T>['where'],
    };

    if (select) {
      options.select = select;
    }

    if (relations) {
      options.relations = relations;
    }

    return this.manager.findOne(this.classEntity, options);
  }

  async findOneEntity(options: FindOneOptions<T>): Promise<T | null> {
    return this.manager.findOne(this.classEntity, options);
  }

  async createEntity(entity: T): Promise<T> {
    const newEntity = this.manager.create(this.classEntity, entity);
    return this.manager.save(newEntity);
  }

  async createManyEntities(entities: T[]): Promise<T[]> {
    const repository = this.manager.getRepository(this.classEntity);
    const createdEntities = repository.create(entities);
    await repository.insert(createdEntities as Parameters<typeof repository.insert>[0]);

    const insertedIds = createdEntities.map((entity) => entity.id).filter((id) => id != null);

    if (insertedIds.length === 0) {
      return [];
    }

    return repository.find({
      where: { id: In(insertedIds) } as FindManyOptions<T>['where'],
    });
  }

  async updateEntity(id: number, updates: Partial<T>): Promise<T | null> {
    const entity = await this.findById(id);
    if (!entity) {
      return null;
    }

    Object.assign(entity, updates);
    await this.manager.save(entity);
    return entity;
  }

  async saveEntity(entity: T): Promise<T> {
    return this.manager.save(entity);
  }

  async saveManyEntities(entities: T[]): Promise<T[]> {
    if (entities.length === 0) {
      return [];
    }
    return this.manager.save(this.classEntity, entities);
  }

  async findByIds(ids: number[], select?: FindOptionsSelect<T>, relations?: FindOptionsRelations<T>): Promise<T[]> {
    if (ids.length === 0) {
      return [];
    }

    const options: FindManyOptions<T> = {
      where: { id: In(ids) } as FindManyOptions<T>['where'],
    };

    if (select) {
      options.select = select;
    }

    if (relations) {
      options.relations = relations;
    }

    return this.manager.find(this.classEntity, options);
  }

  async updateManyEntitiesByIds(ids: number[], updates: Partial<T>[]): Promise<T[]> {
    const entitiesToUpdate = await this.findByIds(ids);
    if (entitiesToUpdate.length === 0) {
      return [];
    }

    const updatedEntities = entitiesToUpdate.map((entity, index) => Object.assign(entity, updates[index]));

    return this.manager.save(updatedEntities);
  }

  async deleteById(id: number): Promise<boolean> {
    return this.softDeleteById(id);
  }

  async softDeleteById(id: number): Promise<boolean> {
    const result = await this.manager.softDelete(this.classEntity, id);
    return (result.affected ?? 0) > 0;
  }

  async hardDeleteById(id: number): Promise<boolean> {
    const result = await this.manager.delete(this.classEntity, id);
    return (result.affected ?? 0) > 0;
  }
}
