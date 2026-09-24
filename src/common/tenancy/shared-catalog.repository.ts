import {
  EntityManager,
  FindManyOptions,
  FindOneOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { BaseRepository } from '@persistence/repositories/base.repository';
import { scopeSharedWhere } from './scope-shared-where';
import { TenantBaseEntity } from './tenant.entity';
import { TenantRepository } from './tenant.repository';

/** Reads own rows and global rows (`organization_id IS NULL`). Writes stay on the current organization. */
export class SharedCatalogRepository<T extends TenantBaseEntity> extends TenantRepository<T> {
  constructor(classEntity: new () => T, repositoryEntityManager: EntityManager) {
    super(classEntity, repositoryEntityManager);
  }

  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    const query = BaseRepository.prototype.createQueryBuilder.call(this, alias);
    const root = alias ?? query.alias;
    return query.andWhere(`(${root}.organizationId = :tenantOrganizationId OR ${root}.organizationId IS NULL)`, {
      tenantOrganizationId: this.organizationId,
    });
  }

  async findAll(page = 1, limit = 10, options?: FindManyOptions<T>) {
    return BaseRepository.prototype.findAll.call(this, page, limit, this.sharedOptions(options));
  }

  async findAllWithoutPagination(options?: FindManyOptions<T>): Promise<T[]> {
    return BaseRepository.prototype.findAllWithoutPagination.call(this, this.sharedOptions(options));
  }

  async findOneEntity(options: FindOneOptions<T>): Promise<T | null> {
    return BaseRepository.prototype.findOneEntity.call(this, {
      ...options,
      where: scopeSharedWhere(options.where as never, this.organizationId) as FindOneOptions<T>['where'],
    });
  }

  private sharedOptions(options?: FindManyOptions<T>): FindManyOptions<T> {
    return {
      ...options,
      where: scopeSharedWhere(options?.where as never, this.organizationId) as FindManyOptions<T>['where'],
    };
  }
}
