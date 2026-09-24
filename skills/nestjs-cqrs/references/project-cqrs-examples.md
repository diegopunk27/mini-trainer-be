# Project CQRS Examples - Best Practices

This document references real CQRS implementations in the project that demonstrate best practices.

## Transaction Management with UnitOfWorkService

**File**: `src/modules/payroll/services/payroll.service.ts`
**Method**: `createPayroll()`

**What it demonstrates**:
- Commands initialized BEFORE `withTransaction` call
- Multiple file uploads (temp bucket + backup bucket)
- Error handling with cleanup
- Passing initialized commands array
- Setting entityManager on commands inside transaction

**Key Pattern**:
```typescript
// Step 1: Initialize ALL commands first
const processCommand = this.createProcessCommand(file.originalname);
const createPayrollCommand = this.createPayrollCommand(dto, user.id);
const tempFileCommand = this.generateTemporaryUploadFileCommand(file, uniqueFilename);
const backupFileCommand = this.generateBackupUploadFileCommand(file, user.email, uniqueFilename);

// Step 2: Execute transaction
return await this.unitOfWorkService.withTransaction(
  async () => {
    const process = await this.commandBus.execute<Process>(processCommand);
    // ... execute other commands
  },
  [createPayrollCommand, processCommand, tempFileCommand, backupFileCommand]
);
```

## Command Handlers with Validation

**Search for**: `**/commands/**/create-*.handler.ts`

Good examples:
- `src/modules/items/commands/create-item/create-item.handler.ts`
- `src/modules/payroll/commands/create-payroll.handler.ts`
- `src/modules/invoice-workflow/commands/create-invoice-workflow/create-invoice-workflow.handler.ts`

**Key patterns to look for**:
- Extending `TransactionalHandler`
- Using `executeTransactionalCommand` wrapper
- Validation before creation
- Using static validators
- Proper exception throwing

## Approval Workflow Handlers

**Files**:
- `src/modules/items/commands/approve-item/approve-item.handler.ts`
- `src/modules/invoice-workflow/commands/approve-invoice/approve-invoice.handler.ts`
- `src/modules/skyledger/commands/approve-skyledger-subprocess/approve-skyledger-subprocesses.handler.ts`

**What they demonstrate**:
- State machine transitions
- Role-based business logic
- Complex validation rules
- State updates with transactions

## Update Handlers

**Files**:
- `src/modules/items/commands/update-item/update-item.handler.ts`
- `src/modules/users/commands/patch-user/patch-user.handler.ts`
- `src/modules/process/commands/update-process/update-process.handler.ts`

**Key patterns**:
- Finding existing entity first
- Validating update permissions
- Partial updates with Partial<T>
- Using `updateEntity()` from BaseRepository

## File Upload Commands

**Files**:
- `src/modules/files/commands/upload-file/upload-file.handler.ts`
- `src/modules/files/commands/upload-files/upload-files.handler.ts`
- `src/modules/items/commands/upload-files-item/upload-files-item.handler.ts`

**What they demonstrate**:
- S3 file upload in transactions
- Creating file records in database
- Handling multipart file uploads
- Error handling and cleanup

## Query Handlers with Complex Filtering

**Search for**: `**/queries/**/*.handler.ts`

Good examples:
- Query handlers that use `findAll()` with pagination
- Query handlers that use Query Builder for complex searches
- Handlers that join multiple relations

**Common BaseRepository methods used**:
```typescript
// Paginated
findAll(page, limit, options)

// Without pagination
findAllWithoutPagination(options)

// By ID
findById(id, select, relations)

// With full options
findOneEntity(options)
```

## Repositories

**Search for**: `**/repositories/*.repository.ts`

All repositories extend `BaseRepository<T>`:
```typescript
@EntityRepository(Entity)
export class EntityRepository extends BaseRepository<Entity> {
  // Custom methods
}
```

**What to look for**:
- Custom query methods
- Using BaseRepository inherited methods
- Query optimization with relations
- Avoiding N+1 queries

## Module Configuration

**Any module file**: `**/modules/**/*.module.ts`

**Key pattern**:
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity]),
    CqrsModule,  // Always required
  ],
  providers: [
    ...repositories,
    ...commands,
    ...queries,
    ...services,
  ],
  controllers: [EntityController],
  exports: [EntityRepository],
})
```

## Controllers

**Search for**: `**/controllers/*.controller.ts`

All controllers extend `CqrsController`:
```typescript
@Controller('resource')
export class ResourceController extends CqrsController {
  @Post()
  async create(@Body() dto: CreateResourceDto) {
    return this.executeCommand(new CreateResourceCommand(dto));
  }

  @Get()
  async findAll() {
    return this.executeQuery(new GetAllResourcesQuery());
  }
}
```

## Validators

**Search for**: `**/validators/*.validator.ts`

Validators are static classes with no dependencies:
```typescript
export class ResourceValidator {
  static validate(command: Command, data: Data): void {
    if (/* condition */) {
      throw new ConflictException('Error message');
    }
  }
}
```

## Mappers

**Search for**: `**/mappers/*.mapper.ts`

Mappers transform entities to DTOs:
```typescript
export class ResourceMapper {
  static toResponseDto(entity: Resource): ResourceResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      // ... other fields
    };
  }
}
```

## Finding Specific Patterns

```bash
# Find all command handlers
find src/modules -path "*/commands/*/*.handler.ts"

# Find all query handlers
find src/modules -path "*/queries/*/*.handler.ts"

# Find transaction usage
grep -r "withTransaction" src/modules --include="*.ts"

# Find TransactionalHandler usage
grep -r "extends TransactionalHandler" src/modules --include="*.ts"

# Find CommandBus usage
grep -r "CommandBus" src/modules --include="*.service.ts"

# Find static validators
grep -r "static validate" src/modules --include="*.validator.ts"

# Find BaseRepository extensions
grep -r "extends BaseRepository" src/modules --include="*.repository.ts"
```

## Anti-Patterns to Avoid

Looking at the codebase, avoid:
- Business logic in controllers
- Commands/queries with database dependencies
- Validators with repository injection
- Direct service calls from controllers (use CommandBus/QueryBus)
- Commands initialized inside withTransaction
- Missing TransactionalHandler for write operations
- Not setting entityManager on commands in transactions

## Best Examples to Study

1. **Transaction Management**: `payroll.service.ts` - Perfect example of complex transaction
2. **Approval Workflow**: `approve-item.handler.ts` - State machine with role validation
3. **File Upload**: `upload-files-item.handler.ts` - File + DB in transaction
4. **Complex Query**: Item queries with multiple filters and relations
5. **Module Setup**: Any recent module for proper CQRS setup
