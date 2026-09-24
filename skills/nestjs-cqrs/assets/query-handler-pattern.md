# Query Handler Pattern

**Pattern Template** - Handlers for read operations (GET requests)

## List Query Handler with Pagination

```typescript
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ListResponseDto } from '@persistence';
import { GetAllResourcesQuery } from './get-all-resources.query.dto';
import { ResourceRepository } from '../../repositories/resource.repository';
import { ResourceResponseDto } from '../../responses/resource.response.dto';
import { ResourceMapper } from '../../mappers/resource.mapper';

/**
 * Query Handler for listing all resources with pagination
 * Query handlers DON'T extend TransactionalHandler (read-only)
 */
@QueryHandler(GetAllResourcesQuery)
export class GetAllResourcesQueryHandler
  implements IQueryHandler<GetAllResourcesQuery> {

  constructor(
    private readonly resourceRepository: ResourceRepository,
  ) {}

  /**
   * Execute query - return paginated results
   * Uses BaseRepository.findAll() which returns ListResponseDto
   */
  async execute(query: GetAllResourcesQuery): Promise<ListResponseDto<ResourceResponseDto>> {
    const { page = 1, limit = 10, categoryId, active, search } = query;

    // Build where conditions
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (active !== undefined) where.active = active;

    // Use BaseRepository.findAll for pagination
    const result = await this.resourceRepository.findAll(page, limit, {
      where,
      relations: {
        category: true,
        createdBy: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Map entities to DTOs
    return {
      results: result.results.map(resource => ResourceMapper.toResponseDto(resource)),
      count: result.count,
      page: result.page,
      limit: result.limit,
    };
  }
}
```

## Single Entity Query Handler

```typescript
@QueryHandler(GetResourceByIdQuery)
export class GetResourceByIdQueryHandler
  implements IQueryHandler<GetResourceByIdQuery> {

  constructor(
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async execute(query: GetResourceByIdQuery): Promise<ResourceResponseDto> {
    // Use BaseRepository.findById with relations
    const resource = await this.resourceRepository.findById(
      query.id,
      undefined,  // select - use default (all fields)
      {
        category: true,
        createdBy: true,
        approvals: true,
      }
    );

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${query.id} not found`);
    }

    return ResourceMapper.toResponseDto(resource);
  }
}
```

## Complex Query with Query Builder

Use when Find Options become too complex (LIKE, OR, complex joins):

```typescript
@QueryHandler(SearchResourcesQuery)
export class SearchResourcesQueryHandler
  implements IQueryHandler<SearchResourcesQuery> {

  constructor(
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async execute(query: SearchResourcesQuery): Promise<ListResponseDto<ResourceResponseDto>> {
    const { page = 1, limit = 10, search, categoryIds, minDate, maxDate } = query;

    // Use Query Builder for complex searches
    const queryBuilder = this.resourceRepository
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.category', 'category')
      .leftJoinAndSelect('resource.createdBy', 'createdBy');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(resource.name LIKE :search OR resource.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (categoryIds && categoryIds.length > 0) {
      queryBuilder.andWhere('resource.categoryId IN (:...categoryIds)', { categoryIds });
    }

    if (minDate) {
      queryBuilder.andWhere('resource.createdAt >= :minDate', { minDate });
    }

    if (maxDate) {
      queryBuilder.andWhere('resource.createdAt <= :maxDate', { maxDate });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Apply ordering
    queryBuilder.orderBy('resource.createdAt', 'DESC');

    // Execute
    const [results, count] = await queryBuilder.getManyAndCount();

    return {
      results: results.map(resource => ResourceMapper.toResponseDto(resource)),
      count,
      page,
      limit,
    };
  }
}
```

## Query Without Pagination (Master Data)

```typescript
@QueryHandler(GetActiveResourcesQuery)
export class GetActiveResourcesQueryHandler
  implements IQueryHandler<GetActiveResourcesQuery> {

  constructor(
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async execute(query: GetActiveResourcesQuery): Promise<ResourceResponseDto[]> {
    // Use findAllWithoutPagination for non-paginated results
    const resources = await this.resourceRepository.findAllWithoutPagination({
      where: { active: true },
      relations: { category: true },
      order: { name: 'ASC' },
    });

    return resources.map(resource => ResourceMapper.toResponseDto(resource));
  }
}
```

## Aggregated Query Handler

```typescript
@QueryHandler(GetResourceDashboardQuery)
export class GetResourceDashboardQueryHandler
  implements IQueryHandler<GetResourceDashboardQuery> {

  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly approvalRepository: ApprovalRepository,
  ) {}

  async execute(query: GetResourceDashboardQuery): Promise<ResourceDashboardDto> {
    // Run queries in parallel
    const [totalResources, activeResources, categories, pendingApprovals] = await Promise.all([
      this.resourceRepository.count(),
      this.resourceRepository.count({ where: { active: true } }),
      this.categoryRepository.findAllWithoutPagination(),
      this.approvalRepository.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalResources,
      activeResources,
      categories: categories.length,
      pendingApprovals,
    };
  }
}
```

## Key Patterns

1. **Query handlers DON'T extend TransactionalHandler** (read-only)
2. **Use BaseRepository methods**:
   - `findAll()` for paginated results → returns `ListResponseDto<T>`
   - `findAllWithoutPagination()` for all results → returns `T[]`
   - `findById()` for single entity by ID
   - `findOneEntity()` for single entity with options
3. **Use Query Builder** for complex searches with LIKE, IN, OR conditions
4. **Always map entities to DTOs** before returning
5. **Throw NotFoundException** when entity not found
6. **Include necessary relations** to avoid N+1 queries
7. **Use Promise.all()** for parallel queries
8. **Return typed responses** (`ListResponseDto<T>`, DTO, DTO[])

## When to Use Query Builder vs Find Options

**Use Find Options (Preferred)**:
```typescript
// Simple queries with AND conditions
findAll(page, limit, {
  where: { active: true, categoryId: 1 },
  relations: { category: true },
})
```

**Use Query Builder**:
```typescript
// Complex queries with OR, LIKE, IN
queryBuilder
  .where('(name LIKE :search OR description LIKE :search)', { search })
  .andWhere('categoryId IN (:...ids)', { ids })
```
