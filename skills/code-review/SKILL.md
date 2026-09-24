# Code Review Rules - NestJS CQRS Base Template

---
name: code-review
description: >
  Code review guidelines and architectural patterns for NestJS CQRS Base Template (NestJS/CQRS). Trigger: When reviewing code, implementing features, or ensuring architectural compliance.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Reviewing pull requests"
    - "Implementing new features"
    - "Refactoring code"
    - "Adding environment variables"
    - "Creating database migrations"
---

## Architecture & Design Patterns

### CQRS Pattern (Mandatory)

- All controllers MUST extend `CqrsController` from the project's CQRS module
- Write operations MUST use `executeCommand()` with a Command class
- Read operations MUST use `executeQuery()` with a Query class
- **Controllers** MUST NOT call repositories or services directly - only call `executeCommand()` or `executeQuery()`
- **Handlers** MAY call repositories directly (this is the correct pattern)
- Every Command/Query MUST have its own dedicated Handler class
- Handlers MUST be decorated with `@CommandHandler(CommandClass)` or `@QueryHandler(QueryClass)`
- **Handlers MUST NOT inject application services that orchestrate `CommandBus`/`QueryBus`** (e.g. facades that dispatch other commands/queries). For data or side effects inside a handler, inject `QueryBus`/`CommandBus` and execute the specific Query/Command, or inject repositories/mappers/utilities only. This prevents circular dependencies (handler → service → bus → handler), keeps tests small, and preserves clear CQRS layering.

**Example:**
```typescript
// ✅ Correct
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

// ❌ Incorrect
@Controller('resource')
export class ResourceController {
  constructor(private readonly service: ResourceService) {}

  @Get()
  async findAll() {
    return this.service.findAll(); // Should use QueryBus
  }
}
```

### Module Structure (Mandatory)

All feature modules MUST follow this file organization:

```
module-name/
├── commands/
│   └── {command-name}/
│       ├── {command-name}.command.dto.ts
│       └── {command-name}.handler.ts
├── queries/
│   └── {query-name}/
│       ├── {query-name}.query.dto.ts
│       └── {query-name}.handler.ts
├── controllers/
│   └── {feature}.controller.ts
├── repositories/
│   └── {entity-name}.repository.ts
├── entities/
│   └── {entity-name}.entity.ts
├── dto/ or dtos/
│   └── *.request.dto.ts
├── responses/
│   └── *.response.dto.ts
├── events/ (if applicable)
│   └── {event-name}/
│       ├── {event-name}.event.ts
│       └── handlers/
├── enums/
├── constants/
├── mappers/
├── validators/
└── {module-name}.module.ts
```

- Commands and Queries MUST be in separate folders with their handlers
- Each command/query MUST have its own subfolder under `commands/` or `queries/`
- Do NOT mix commands and queries in the same file or folder

### Repository Pattern (Mandatory)

- All repositories MUST extend `BaseRepository<Entity>` from `@persistence` **OR** `Repository<Entity>` if the entity extends `MasterEntity`
  - Use `BaseRepository<Entity>` for business entities (extend `BaseEntity`)
  - Use `Repository<Entity>` for simple master/catalog entities (extend `MasterEntity` only)
- Repositories MUST be decorated with `@EntityRepository(Entity)`
- Custom query methods MUST use descriptive action verbs: `getById()`, `findAll()`, `findAllWithoutPagination()`
- PREFER TypeORM Find Options over Query Builder when possible for better type safety
- Use Query Builder ONLY when Find Options cannot achieve the desired result or when complex joins are required
- AVOID complex nested conditions in Find Options that may cause TypeORM query generation issues
- Relations MUST be defined in query options to prevent N+1 queries
- For complex queries, prefer multiple simple queries over one complex query with unreliable nested conditions

**Example:**
```typescript
// ✅ Preferred: Single query with relations
findOrdersWithItemsByDate(startDate: Date, endDate: Date): Promise<Order[]> {
  return this.findAllWithoutPagination({
    where: { createdAt: Between(startDate, endDate) },
    relations: { items: true, customer: true }
  });
}

// ✅ Acceptable: Multiple simple queries when complexity threshold is reached
async findOrdersWithItems(startDate: Date, endDate: Date) {
  const orders = await this.findOrdersByDate(startDate, endDate);
  const orderIds = orders.map(o => o.id);
  const items = await this.itemRepository.findByOrderIds(orderIds);
  return { orders, items };
}

// ❌ Avoid: Complex nested conditions that may break
findOrdersWithItemsByDate(startDate: Date, endDate: Date): Promise<Order[]> {
  return this.findAllWithoutPagination({
    where: {
      createdAt: Between(startDate, endDate),
      items: { status: 'active', category: { name: Like('%electronics%') } }
    },
    relations: { items: { category: true }, customer: true }
  });
}
```

### Transaction Management (Mandatory)

- Transactional write operations MUST use handlers that extend `TransactionalHandler` from `@persistence`
- For service-level transactions, MUST use `UnitOfWorkService.withTransaction()`
- Complex multi-phase operations MUST split transactions to prevent deadlocks
- Commands MAY include optional `@ApiHideProperty() entityManager: EntityManager` for transaction context
- Handlers MUST inject required repositories through constructor

**Example:**
```typescript
// ✅ Correct: TransactionalHandler
export class CreateResourceCommandHandler
  extends TransactionalHandler
  implements ICommandHandler<CreateResourceCommand> {

  constructor(
    private readonly repository: ResourceRepository
  ) {
    super();
  }

  async execute(command: CreateResourceCommand): Promise<Resource> {
    return this.executeTransactionalCommand(
      async () => {
        // transaction operations
      },
      [this.repository],
      command.entityManager
    );
  }
}

// ✅ Correct: Service with UnitOfWorkService
export class SomeService {
  constructor(private readonly unitOfWorkService: UnitOfWorkService) {}

  async someOperation() {
    return this.unitOfWorkService.withTransaction(async (session) => {
      // Phase 1: Core operations
    });

    // Phase 2: Separate transaction for auto-approval (if needed)
    return this.unitOfWorkService.withTransaction(async (session) => {
      // Auto-approval logic
    });
  }
}
```

### Event-Driven Patterns (When Applicable)

- Complex workflows SHOULD use events to trigger async side effects
- Event classes SHOULD be named `{Action}Event` or `{Entity}{Action}NotificationEvent`
- Event handlers SHOULD extend `BaseEventHandler` when using template method pattern
- Event handlers MUST implement: `shouldProcess()`, `getRequiredParams()`, `validateParams()`, `processNotification()`
- Events SHOULD be published AFTER successful command execution, not before
- Notification events SHOULD be handled asynchronously and MUST NOT block the main operation

## DTOs & Validation

### DTO Validation (Mandatory)

- All Request DTOs, Command DTOs, and Query DTOs MUST use `class-validator` decorators
- Use `@IsNotEmpty()`, `@IsString()`, `@IsNumber()`, `@IsOptional()`, `@IsEnum()`, etc.
- For nested objects, use `@ValidateNested({ each: true })` with `@Type(() => NestedDto)`
- Custom validators MUST be used for domain-specific rules: `@Validate(NotContainOnlyWhiteSpacesStringConstraint)`
- Response DTOs rely on the Swagger plugin. `@ApiProperty` only for enums, examples, and nullable or union types
- Use `@ValidateIf()` for conditional validation based on other fields
- **Important:** Response DTOs use `class-validator` for test-time `validateAndTransformResponse`. Do not decorate every response field with `@ApiProperty`

**Example:**
```typescript
// ✅ Correct
export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ValidateIf((o) => o.categoryId === SpecificCategoryEnum.SPECIAL)
  @IsString()
  @IsNotEmpty()
  specialField?: string;

  @ValidateNested({ each: true })
  @Type(() => NestedItemDto)
  items: NestedItemDto[];
}

// Response DTOs must also have validators
export class ResourceResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

### DTO Naming Conventions (Mandatory)

**For detailed DTO patterns, see [controllers skill](../controllers/SKILL.md).**

- Input Commands: `{Action}{Entity}Command` (e.g., `CreateItemCommand`, `UpdateItemCommand`)
- Input Queries: `Get{Entity}Query` or `List{Entity}Query`
- Request DTOs: `{action}-{entity}.dto.ts` (e.g., `create-item.dto.ts`)
- Response DTOs: `{entity}.response.dto.ts` or `{operation}-{entity}.response.dto.ts`
- Query DTOs (GET parameters): `{operation}-{entity}.query.dto.ts` (e.g., `get-items.query.dto.ts`)
- All DTOs MUST be classes, NOT interfaces or types
- DTOs MUST NOT contain business logic methods (only getters/setters if needed)

## Business Logic & Validation

### Validator Pattern (Mandatory)

- Business rule validators MUST be separate classes in `validators/` folder
- Validators MUST use static methods and receive data as parameters
- Validators MUST NOT interact with external dependencies (databases, APIs)
- Database queries MUST be performed in handlers and data passed to validators
- Validator methods MUST throw `ConflictException` or appropriate HTTP exception on validation failure

**Example:**
```typescript
// ✅ Correct
// In Handler
async execute(command: CreateResourceCommand): Promise<ResponseDto> {
  const existingData = await this.repository.findBy({
    someField: command.someField
  });
  ResourceValidator.validateCreation(command, existingData);
  // ... rest of logic
}

// In Validator
export class ResourceValidator {
  static validateCreation(
    command: CreateResourceCommand,
    existingData: Entity[]
  ): void {
    if (existingData.length > 0) {
      throw new ConflictException('Resource already exists');
    }
  }
}

// ❌ Incorrect: Validator making database calls
export class ResourceValidator {
  constructor(private readonly repository: ResourceRepository) {}

  async validateCreation(command: CreateResourceCommand): Promise<void> {
    const existing = await this.repository.findBy({ ... }); // Don't do this
  }
}
```

### Mapper Pattern (Mandatory)

- Entity-to-DTO transformation MUST be isolated in `*.mapper.ts` files
- Mappers MUST use static methods only: `Mapper.toResponseDto(entity)`
- Complex nested transformations SHOULD have helper methods: `transformAttachments()`, `transformApprovals()`
- Date objects MUST be converted to ISO strings in response DTOs: `.toISOString()`
- Mappers MUST NOT contain business logic or validation

**Example:**
```typescript
// ✅ Correct
export class ItemMapper {
  static toResponseDto(item: Item): ItemResponseDto {
    return {
      id: item.id,
      name: item.name,
      createdAt: item.createdAt.toISOString(),
      attachments: this.transformAttachments(item.attachments),
    };
  }

  private static transformAttachments(attachments: Attachment[]): AttachmentDto[] {
    return attachments.map(a => ({ id: a.id, url: a.url }));
  }
}
```

### Exception Handling (Mandatory)

- User-visible errors MUST throw NestJS HTTP exceptions: `ConflictException`, `NotFoundException`, `BadRequestException`
- Error messages MUST be descriptive and user-friendly
- Domain-specific exceptions SHOULD extend NestJS base exceptions
- Error message constants SHOULD be defined in `constants/exceptions.constants.ts`
- Use factories for dynamic error messages: `REPORT_NOT_FOUND(reportType: string)`
- The global `HttpExceptionFilter` will handle logging automatically

**Example:**
```typescript
// ✅ Correct
export class ReportNotFoundException extends NotFoundException {
  constructor(reportType: string) {
    super(REPORTS_ERROR_MESSAGES.REPORT_NOT_FOUND(reportType));
  }
}

// In constants
export const REPORTS_ERROR_MESSAGES = {
  REPORT_NOT_FOUND: (type: string) => `Report of type ${type} not found`,
};

// In handler
if (!report) {
  throw new ReportNotFoundException(reportType);
}
```

## Module Design Principles

### Module Independence (Mandatory)

- Minimize dependencies between modules
- Cross-module **reads** go through the QueryBus
- Atomic cross-module **writes** MAY inject another module's exported repository in the same unit of work (confirm-sale pattern). Injecting another module's repository is not always forbidden
- Non-atomic cross-module writes go through CommandBus
- Each module MUST be self-contained with its own entities, DTOs, handlers
- Modules SHOULD export ONLY what's necessary (a repository is exportable when another module needs it in the same UoW)
- AVOID circular dependencies between modules
- Share DTOs, interfaces, and — when the confirm-sale pattern applies — the exported repository. Do not share orchestration services

### Module Provider Organization (Recommended)

- Organize providers into arrays before spreading into module decorator
- Group by type: `repositories`, `queries`, `commands`, `services`, `events`
- This improves readability and maintainability

**Example:**
```typescript
// ✅ Correct
const repositories = [Repo1, Repo2];
const queries = [QueryHandler1, QueryHandler2];
const commands = [CommandHandler1, CommandHandler2];
const services = [Service1];
const events = [EventHandler1];

@Module({
  imports: [TypeOrmModule.forFeature(entities), OtherModule],
  providers: [...repositories, ...queries, ...commands, ...services, ...events],
  exports: [SomeRepository],
  controllers: [FeatureController],
})
export class FeatureModule {}
```

## API Design & Controllers

### Route Structure (Mandatory)

- List/Collection: `GET /resource`
- Detail: `GET /resource/:id`
- Create: `POST /resource`
- Update: `PATCH /resource/:id` (use PATCH, not PUT)
- Delete: `DELETE /resource/:id`
- Actions: `POST /resource/:id/{action}` (e.g., `POST /items/:id/approve`)
- Master data/dropdowns: `GET /resource/master` or `GET /resource/references`

### Controller Patterns (Mandatory)

- Controllers MUST be thin - only route requests to commands/queries
- Controllers MUST NOT contain business logic
- Controllers MUST use proper HTTP status decorators: `@HttpCode(HttpStatus.OK)`
- Controllers MUST use guards for authentication/authorization: `@UseGuards(JWTPermissionsGuard)`
- Controllers MUST use permission decorators: `@RequirePermissions(...permissions)`
- Controllers MUST use Swagger decorators for documentation: `@ApiOperation()`, `@ApiResponse()`

### Swagger/OpenAPI Documentation (Mandatory)

**See [controllers skill](../controllers/SKILL.md) for detailed Swagger patterns.**

**Quick Rules:**
- Response DTOs rely on the Swagger plugin. `@ApiProperty` only for enums, examples, and nullable or union types
- Optional / nullable / union fields that the plugin cannot infer MUST have `@ApiProperty({ nullable: true })` (or equivalent)
- Enums MUST use `@ApiProperty({ enum: EnumName })`
- **Paginated GET endpoints MUST use `@ApplySwaggerPaginationResponse(ResponseDtoClass)`** decorator (for endpoints returning `ListResponseDto<T>`)
- **Simple GET endpoints SHOULD NOT use pagination decorator**
- Controllers MUST use `@ApiTags('Resource')` for grouping
- POST/PATCH/DELETE endpoints MAY have `@ApiOperation({ summary: 'Description' })` and `@ApiResponse()` for additional documentation
- **Key Insight:** The Swagger plugin documents `.dto.ts` classes from their types and `class-validator` decorators. Do not add `@ApiProperty` to every field.

## Testing Requirements

### E2E Testing (Mandatory)

- E2E tests MUST be created for all new functionality
- Test files MUST use `.e2e.spec.ts` extension
- Tests MUST use `setupTestingModule()` from project's test config
- Tests MUST follow this structure:
  1. Setup test module with required imports and mocks
  2. Insert test data in `beforeEach()`
  3. Execute test
  4. Assert results
  5. Clean up test data in `afterEach()`
- Response validation MUST use `validateAndTransformResponse(ResponseDto, body)` helper

**Example:**
```typescript
// ✅ Correct
describe('ResourceController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await setupTestingModule({
      imports: [ResourceModule],
      mocks: []
    });

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    // Insert test data
  });

  afterEach(async () => {
    // Clean up test data
  });

  it('should create resource', async () => {
    const response = await request(app.getHttpServer())
      .post('/resource')
      .send(createDto)
      .expect(201);

    const validated = await validateAndTransformResponse(
      ResourceResponseDto,
      response.body
    );
    expect(validated.name).toBe(createDto.name);
  });
});
```

## Environment & Configuration

### Environment Variables (Mandatory)

**CRITICAL RULE - Environment Variable Synchronization:**

When adding a new environment variable, you MUST complete ALL of these steps:

1. **Add to `.env.example`** with a descriptive comment
2. **Add to `.env.testing`** when tests need the variable
3. **Access via `ConfigService`**, NEVER use `process.env` directly
4. **Add the key to `env.schema.ts`** (Zod) so startup validation stays in sync

- Variable names MUST be UPPERCASE_WITH_UNDERSCORES
- Avoid magic strings/numbers - define constants in `constants/` folder

**Example:**

```typescript
// ✅ Correct - Access via ConfigService
constructor(private readonly configService: ConfigService) {}

const from = this.configService.get<string>('SMTP_FROM');

// ❌ Incorrect
const from = process.env.SMTP_FROM;
```

**Review Checklist for Environment Variables:**
- [ ] Variable added to `.env.example` with comment
- [ ] Added to `.env.testing` / CI env when tests need it
- [ ] Declared in `env.schema.ts`
- [ ] Accessed via ConfigService in code
- [ ] No hardcoded values or `process.env` direct access

## Database Migrations

### Database Migration Rules (Mandatory)

When creating a new database migration:

1. **Create migration** in `migrations/` folder using TypeORM CLI:
   ```bash
   npm run typeorm:create-migration -- migrations/MigrationName
   ```
2. Keep schema changes in TypeORM migrations only. This template does **not** use company release scripts under `scripts/{version}/`.
3. Test the migration locally (`typeorm:run-migrations` / revert) before committing.

**Example:**

```
migrations/1234567890-AddItemSku.ts
```

**Review Checklist for Migrations:**
- [ ] Migration file created with a descriptive name
- [ ] SQL/TypeORM statements are idempotent where possible
- [ ] Migration included in the same PR as the entity change
- [ ] No leftover company-specific deploy scripts

## Type Safety & TypeScript

### Type Declarations (Already enforced by eslint, but critical)

- All function parameters and return types MUST be explicitly typed
- Avoid `any` type - create proper types/interfaces when needed
- Use `readonly` for immutable data
- Use `as const` for literal values that don't change
- Prefer `interface` over `type` for object definitions when defining contracts
- Prefer `type` for unions, intersections, or complex compositions

### Async/Await Patterns (Mandatory)

- All handlers MUST return explicitly typed Promises: `Promise<Entity>`, `Promise<ListResponseDto<T>>`
- Use `Promise.all()` for parallel independent operations
- Use `async/await` chains for sequential dependent operations
- NEVER use callbacks or raw Promises (.then/.catch)

**Example:**
```typescript
// ✅ Correct: Parallel operations
async getMasterData(): Promise<MasterDataDto> {
  const [countries, categories, statuses] = await Promise.all([
    this.countryRepository.findAll(),
    this.categoryRepository.findAll(),
    this.statusRepository.findAll(),
  ]);

  return { countries, categories, statuses };
}

// ✅ Correct: Sequential operations
async createWithApproval(dto: CreateDto): Promise<Entity> {
  const entity = await this.repository.save(dto);
  const approval = await this.approvalService.createApproval(entity.id);
  return { ...entity, approval };
}
```

## Service Pattern Rules

### When to Use Services (Important)

- Services SHOULD orchestrate complex workflows involving multiple commands/queries
- Services CAN be called from handlers or other services for transaction management
- Services MAY aggregate multiple query results for "master data" endpoints
- Services SHOULD use `Promise.all()` for parallel data fetching
- Services MUST use `UnitOfWorkService.withTransaction()` for transactional operations

**When NOT to use services:**
- DO NOT call services directly from controllers for simple CRUD operations (use CQRS)
- DO NOT put business logic in services that should be in handlers
- DO NOT use services as a "catch-all" for miscellaneous code

## Logging (Mandatory)

- Use Winston logger, NOT `console.log()`
- Each class SHOULD initialize logger: `private readonly logger = new Logger(ClassName.name)`
- Log levels: `error`, `warn`, `info`, `debug`
- Critical errors SHOULD be logged to database via `CreateLogCommand`
- Include context in log messages: user ID, entity ID, operation name

**Example:**
```typescript
// ✅ Correct
export class SomeHandler {
  private readonly logger = new Logger(SomeHandler.name);

  async execute(command: SomeCommand): Promise<Result> {
    this.logger.log(`Executing command for entity ${command.entityId}`);
    try {
      // logic
    } catch (error) {
      this.logger.error(`Failed to process: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

## Code Quality Principles

### Single Responsibility (Critical)

- One command handler per command class
- One query handler per query class
- One event handler per event type
- Handlers SHOULD focus on orchestration, NOT implementation details
- Extract complex logic to service methods or utility functions

### Immutability (Recommended)

- Command/Query DTOs MUST be immutable data containers
- Prefer `readonly` properties in classes where applicable
- Use `.map()`, `.filter()`, `.reduce()` over mutating array methods
- Clone objects before modifications when necessary

### No Code Duplication (Important)

- Extract repeated logic to utility functions or base classes
- Use abstract base classes for common patterns: `BaseEventHandler`, `TransactionalHandler`
- Share common types/interfaces across modules when appropriate
- Create generic helper functions for repetitive transformations

## File Upload & S3 Patterns

### S3 File Operations (When Applicable)

- File logic MUST be abstracted to `*S3Utils` classes
- Buckets MUST be configured via `ConfigService`, not hardcoded
- File uploads/downloads MUST be handled through Commands/Queries, not directly in controllers
- File metadata SHOULD be tracked in database (Entity with S3 key)
- Support soft deletes for files when applicable

## Security & Authorization

### Authentication & Permissions (Mandatory)

- Protected endpoints MUST use `@UseGuards(JWTPermissionsGuard)`
- Use `@RequirePermissions(...permissions)` decorator for fine-grained access control
- Permissions MUST be from enum: `EPermissionsDatosMaestros`, `EPermissionsPayroll`, etc.
- JWT token validation MUST extract permissions and check against required set
- DO NOT implement custom auth logic - use project's guard system

## State Management

### State Machines (When Applicable)

- Entity states MUST be numeric enums: `Status { PENDING = 1, APPROVED = 2, ... }`
- State transitions MUST be validated in handlers or validators
- Workflow rules MUST be encoded in validators, not scattered across codebase
- State changes SHOULD publish events for async workflows

## Performance Optimization

### Query Optimization (Important)

- Define eager loading relations in repository options to prevent N+1 queries
- Use `relations: { entity: true }` in Find Options
- For complex data aggregation, consider using raw queries with proper type mapping
- Pagination MUST use `BaseRepository.findAll(page, limit, options)` which returns `ListResponseDto<T>`
- AVOID fetching unnecessary data - use projection when possible

### Caching Strategy (Recommended)

- Consider caching for frequently accessed master data
- Use Redis or in-memory cache for dropdown/reference data
- Invalidate cache on entity updates
- Document cache invalidation strategy in service

---

## Code Review Checklist

When reviewing code, check for:

1. **CQRS Compliance**: Controllers use executeCommand/executeQuery, not direct service calls
2. **Module Structure**: Files are in correct folders (commands/, queries/, repositories/, etc.)
3. **Repository Pattern**: Repositories extend BaseRepository and use Find Options primarily
4. **Transactions**: Write handlers extend TransactionalHandler
5. **DTOs**: All DTOs have validation decorators
6. **Validators**: Business logic validators are static and don't access database
7. **Mappers**: Entity-to-DTO transformation is in dedicated mapper classes
8. **Error Handling**: User errors throw descriptive HTTP exceptions
9. **Testing**: E2E tests exist for new functionality
10. **Environment Config**: New env vars are in `.env.example`, `.env.testing` if needed, and `env.schema.ts`
11. **Database Migrations**: New schema changes have a TypeORM migration
12. **Type Safety**: All functions have explicit parameter and return types
13. **Swagger Docs**: All DTOs and endpoints have @Api decorators
14. **Logging**: Winston logger used, not console.log
15. **Security**: Protected endpoints have guards and permission decorators
16. **No Duplication**: Logic is properly abstracted and reused

---

## Anti-Patterns to Avoid

- ❌ Calling repositories directly from controllers
- ❌ Calling services directly from controllers for non-transactional operations
- ❌ Putting business logic in controllers
- ❌ Validators making database calls
- ❌ Using `any` type
- ❌ Using `console.log` instead of Logger
- ❌ Hardcoding configuration values
- ❌ Missing validation decorators on DTOs
- ❌ Complex business logic in mappers
- ❌ Mixing commands and queries in same folder
- ❌ Not using transactions for write operations
- ❌ Missing E2E tests for new features
- ❌ Not documenting APIs with Swagger decorators
- ❌ Creating circular dependencies between modules
- ❌ Using PUT instead of PATCH for updates
- ❌ Not cleaning up test data in E2E tests
- ❌ Adding env vars without updating `.env.example` and `env.schema.ts`
- ❌ Creating entity changes without a TypeORM migration

---

**Note**: These rules complement (not replace) the naming conventions and linting rules enforced by Husky pre-commit hooks. Naming conventions (kebab-case) and code formatting (ESLint/Prettier) are validated automatically before commit.
