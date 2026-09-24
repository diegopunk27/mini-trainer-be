import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  In,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';
import { BaseRepository } from '@persistence/repositories/base.repository';
import { requireOrganizationId, requireUserId } from './request-context';
import { scopeWhere } from './scope-where';
import { TenantBaseEntity } from './tenant.entity';

export class TenantRepository<T extends TenantBaseEntity> extends BaseRepository<T> {
  private readonly tenantEntity: new () => T;

  constructor(classEntity: new () => T, repositoryEntityManager: EntityManager) {
    super(classEntity, repositoryEntityManager);
    this.tenantEntity = classEntity;
  }

  protected get organizationId(): number {
    return requireOrganizationId();
  }

  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    const organizationId = this.organizationId;
    const query = super.createQueryBuilder(alias);
    const root = alias ?? query.alias;
    return query.andWhere(`${root}.organizationId = :tenantOrganizationId`, {
      tenantOrganizationId: organizationId,
    });
  }

  async findAll(page = 1, limit = 10, options?: FindManyOptions<T>) {
    return super.findAll(page, limit, this.scopeOptions(options));
  }

  async findAllWithoutPagination(options?: FindManyOptions<T>): Promise<T[]> {
    return super.findAllWithoutPagination(this.scopeOptions(options));
  }

  async findById(id: number, select?: FindOptionsSelect<T>, relations?: FindOptionsRelations<T>): Promise<T | null> {
    return this.findOneEntity({ where: { id } as FindOneOptions<T>['where'], select, relations });
  }

  async findOneEntity(options: FindOneOptions<T>): Promise<T | null> {
    return super.findOneEntity({
      ...options,
      where: scopeWhere(options.where as never, this.organizationId) as FindOneOptions<T>['where'],
    });
  }

  async findByIds(ids: number[], select?: FindOptionsSelect<T>, relations?: FindOptionsRelations<T>): Promise<T[]> {
    if (ids.length === 0) {
      return [];
    }
    return super.findAllWithoutPagination({
      where: scopeWhere({ id: In(ids) } as never, this.organizationId) as FindManyOptions<T>['where'],
      select,
      relations,
    });
  }

  async createEntity(entity: T): Promise<T> {
    return super.createEntity(this.stamp(entity, true));
  }

  async saveEntity(entity: T): Promise<T> {
    return super.saveEntity(this.stamp(entity, entity.organizationId == null));
  }

  async saveManyEntities(entities: T[]): Promise<T[]> {
    return super.saveManyEntities(entities.map((entity) => this.stamp(entity, entity.organizationId == null)));
  }

  async softDeleteById(id: number): Promise<boolean> {
    const result = await this.manager.softDelete(this.tenantEntity, {
      id,
      organizationId: this.organizationId,
    } as ObjectLiteral);
    return (result.affected ?? 0) > 0;
  }

  async hardDeleteById(id: number): Promise<boolean> {
    const result = await this.manager.delete(this.tenantEntity, {
      id,
      organizationId: this.organizationId,
    } as ObjectLiteral);
    return (result.affected ?? 0) > 0;
  }

  private scopeOptions(options?: FindManyOptions<T>): FindManyOptions<T> {
    return {
      ...options,
      where: scopeWhere(options?.where as never, this.organizationId) as FindManyOptions<T>['where'],
    };
  }

  private stamp(entity: T, assignCreatedBy: boolean): T {
    entity.organizationId = this.organizationId;
    const userId = requireUserId();
    entity.updatedBy = userId ?? entity.updatedBy;
    if (assignCreatedBy) {
      entity.createdBy = userId ?? entity.createdBy;
    }
    return entity;
  }
}
