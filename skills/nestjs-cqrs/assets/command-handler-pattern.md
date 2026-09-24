# Command Handler Pattern with Transactions

**Pattern Template** - Handlers for write operations (POST, PATCH, DELETE)

## Create Command Handler

```typescript
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TransactionalHandler } from '@persistence';
import { CreateResourceCommand } from './create-resource.command.dto';
import { ResourceRepository } from '../../repositories/resource.repository';
import { CategoryRepository } from '@categories/repositories/category.repository';
import { Resource } from '../../entities/resource.entity';
import { ResourceValidator } from '../../validators/resource.validator';
import { ResourceMapper } from '../../mappers/resource.mapper';
import { ResourceResponseDto } from '../../responses/resource.response.dto';

/**
 * Command Handler for creating resources
 * Extends TransactionalHandler for automatic transaction management
 */
@CommandHandler(CreateResourceCommand)
export class CreateResourceCommandHandler
  extends TransactionalHandler
  implements ICommandHandler<CreateResourceCommand> {

  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {
    super();
  }

  /**
   * Execute the command within a transaction
   *
   * Pattern:
   * 1. Use executeTransactionalCommand wrapper
   * 2. Pass repositories array
   * 3. Pass entityManager from command (for nested transactions)
   */
  async execute(command: CreateResourceCommand): Promise<ResourceResponseDto> {
    return this.executeTransactionalCommand(
      async () => {
        // Step 1: Validate
        await this.validateResource(command);

        // Step 2: Create entity
        const resource = this.resourceRepository.create({
          name: command.name,
          description: command.description,
          categoryId: command.categoryId,
          active: true,
        });

        // Step 3: Save to database
        const savedResource = await this.resourceRepository.saveEntity(resource);

        // Step 4: Map to response DTO
        return ResourceMapper.toResponseDto(savedResource);
      },
      [this.resourceRepository, this.categoryRepository],  // Repositories to be managed
      command.entityManager  // For nested transactions
    );
  }

  /**
   * Validation logic
   * - Query database for validation checks
   * - Use static validator for business rules
   * - Throw ConflictException or NotFoundException as needed
   */
  private async validateResource(command: CreateResourceCommand): Promise<void> {
    // Check if category exists
    const category = await this.categoryRepository.findById(command.categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${command.categoryId} not found`);
    }

    // Check for duplicate names
    const existingResource = await this.resourceRepository.findOneEntity({
      where: { name: command.name },
    });

    if (existingResource) {
      throw new ConflictException('Resource with this name already exists');
    }

    // Use static validator for complex business rules
    ResourceValidator.validateCreation(command, category);
  }
}
```

## Update Command Handler

```typescript
@CommandHandler(UpdateResourceCommand)
export class UpdateResourceCommandHandler
  extends TransactionalHandler
  implements ICommandHandler<UpdateResourceCommand> {

  constructor(
    private readonly resourceRepository: ResourceRepository,
  ) {
    super();
  }

  async execute(command: UpdateResourceCommand): Promise<ResourceResponseDto> {
    return this.executeTransactionalCommand(
      async () => {
        // Find existing resource
        const resource = await this.resourceRepository.findById(command.id);
        if (!resource) {
          throw new NotFoundException(`Resource with ID ${command.id} not found`);
        }

        // Validate update
        ResourceValidator.validateUpdate(resource, command);

        // Update entity
        const updatedResource = await this.resourceRepository.updateEntity(
          command.id,
          {
            name: command.name,
            description: command.description,
            categoryId: command.categoryId,
          }
        );

        return ResourceMapper.toResponseDto(updatedResource);
      },
      [this.resourceRepository],
      command.entityManager
    );
  }
}
```

## Delete Command Handler

```typescript
@CommandHandler(DeleteResourceCommand)
export class DeleteResourceCommandHandler
  extends TransactionalHandler
  implements ICommandHandler<DeleteResourceCommand> {

  constructor(
    private readonly resourceRepository: ResourceRepository,
  ) {
    super();
  }

  async execute(command: DeleteResourceCommand): Promise<void> {
    return this.executeTransactionalCommand(
      async () => {
        // Verify exists before deletion
        const resource = await this.resourceRepository.findById(command.id);
        if (!resource) {
          throw new NotFoundException(`Resource with ID ${command.id} not found`);
        }

        // Soft delete or hard delete depending on requirements
        const deleted = await this.resourceRepository.deleteById(command.id);

        if (!deleted) {
          throw new ConflictException('Failed to delete resource');
        }
      },
      [this.resourceRepository],
      command.entityManager
    );
  }
}
```

## Key Patterns

1. **Always extend TransactionalHandler** for write operations
2. **Use executeTransactionalCommand** wrapper
3. **Pass array of repositories**
4. **Pass command.entityManager** for nested transactions
5. **Keep validation separate** from business logic
6. **Use static validators** (no DB access in validator)
7. **Use mappers** to transform entities to DTOs
8. **Throw appropriate exceptions** (NotFoundException, ConflictException)
9. **Return typed responses**

## Static Validator Example

```typescript
// validators/resource.validator.ts
export class ResourceValidator {
  static validateCreation(command: CreateResourceCommand, category: Category): void {
    if (!category.active) {
      throw new ConflictException('Cannot create resource in inactive category');
    }

    if (command.name.length < 3) {
      throw new ConflictException('Resource name must be at least 3 characters');
    }
  }

  static validateUpdate(resource: Resource, command: UpdateResourceCommand): void {
    if (resource.locked) {
      throw new ConflictException('Cannot update locked resource');
    }
  }
}
```

## Mapper Example

```typescript
// mappers/resource.mapper.ts
export class ResourceMapper {
  static toResponseDto(resource: Resource): ResourceResponseDto {
    return {
      id: resource.id,
      name: resource.name,
      description: resource.description,
      categoryId: resource.categoryId,
      categoryName: resource.category?.name,
      active: resource.active,
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
    };
  }
}
```
