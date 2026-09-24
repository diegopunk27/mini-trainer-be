# NestJS CQRS - NestJS CQRS Base Template

---
name: nestjs-cqrs
description: >
  CQRS pattern implementation with NestJS, transactions, and CQRS architecture. For controller creation and API documentation, see controllers skill. Trigger: When creating commands/queries, handlers, transactions, or modules.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Creating commands or queries"
    - "Implementing CQRS handlers"
    - "Setting up transactional operations"
    - "Creating new modules"
    - "Creating entities with TypeORM"
    - "Creating many-to-many relationships"
    - "Working with CommandBus or QueryBus"
---

## When to Use

- Creating CQRS commands (write operations)
- Creating CQRS queries (read operations)
- Implementing handlers for commands/queries
- Setting up transactions with multiple operations
- Creating new NestJS modules with CQRS

---

## Critical Rules

1. **Controllers extend CqrsController**: All controllers MUST extend `CqrsController` (see [controllers skill](../controllers/SKILL.md))
2. **Swagger DTOs**: Use `.dto.ts` files in `@Body()`. The Swagger plugin documents fields. `@ApiProperty` only for enums, examples, and nullable or union types (see [controllers skill](../controllers/SKILL.md))
3. **Commands for Writes**: POST, PATCH, DELETE → `executeCommand()`
4. **Queries for Reads**: GET → `executeQuery()`
5. **Transactions**: Write handlers MUST extend `TransactionalHandler`
6. **Initialize Commands First**: Commands MUST be initialized BEFORE `withTransaction`
7. **Static Validators are allowed**: pure functions (static methods or standalone functions). No DB, no injected repositories, no HTTP. Fetch data in the handler and pass it in.
8. **Entity Inheritance**: Entities MUST extend `BaseEntity` or `MasterEntity` appropriately
9. **No Repository in Service**: Services MUST NOT inject or call Repositories directly. Data access MUST go through Handlers (Repository in Handler) or through QueryBus/CommandBus
10. **Handlers MUST NOT depend on orchestration services**: Command/Query handlers MUST NOT inject application `*Service` classes that themselves use `CommandBus` or `QueryBus` to dispatch other commands/queries. Use `QueryBus`/`CommandBus` in the handler for the specific read/write you need (or repositories/mappers only). Rationale: avoids handler → service → bus → handler cycles, simplifies unit tests, and keeps CQRS boundaries clear.
11. **Cross-module reads**: go through the QueryBus. Do not inject another module's repository just to read.
12. **Atomic cross-module writes (confirm-sale pattern)**: a command handler MAY inject another module's **exported** repository when both writes must share the same unit of work. This is not always forbidden. Regular (non-atomic) writes still go through CommandBus.
13. **Tenant**: las tablas del tenant no usan un subscriber. El repositorio fuerza `organization_id` desde el contexto. Ver la skill `multi-tenancy`.

---

## Validation Rules

### Use class-validator for All Validations

**Request DTOs (Command DTOs):**
- ✅ Use `class-validator` decorators: `@IsNotEmpty()`, `@IsString()`, `@MaxLength()`, etc.
- ✅ Use `@ValidateIf()` for conditional validation based on other fields
- ✅ Use `@IsIn()`, `@ArrayNotEmpty()`, `@IsArray()` for complex validations
- ✅ Static validators are allowed for business rules: pure functions, no DB
- ❌ NEVER access database in validators (query in the handler, pass data in)

**Response DTOs:**
- ✅ Use `class-validator` decorators for testing (`validateAndTransformResponse`)
- ✅ Swagger plugin documents response fields from the class. `@ApiProperty` only for enums, examples, and nullable or union types
- ❌ Do not sprinkle `@ApiProperty` on every response field — the plugin already infers them

**Example:**
```typescript
// ✅ Command DTO with class-validator
export class CreateResourceCommand implements ITransactionalEvent {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ValidateIf((o) => o.type === 'special')
  @IsNotEmpty()
  @IsString()
  specialField?: string;

  @ApiHideProperty()
  entityManager: EntityManager;
}

// ✅ Response DTO with class-validator
export class ResourceResponseDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
```

### No Barrel Exports (index.ts)

❌ **NEVER use index.ts files:**
```typescript
// ❌ WRONG - Don't create index.ts
export * from './command1';
export * from './command2';
```

✅ **ALWAYS import directly:**
```typescript
// ✅ CORRECT
import { CreateCommand } from './commands/create/create.command.dto';
import { UpdateCommand } from './commands/update/update.command.dto';
```

## Entity Pattern Rules

### When to Use BaseEntity vs MasterEntity

**Use `BaseEntity` (from @persistence) when:**
- Entity has auto-generated `id` (INT AUTO_INCREMENT)
- Entity has audit fields (`created_at`, `updated_at`, `deleted_at`)
- Entity has business logic and relationships
- Soft deletes are needed

```typescript
// ✅ Correct - Entity with audit fields
import { BaseEntity } from '@persistence';

@Entity('ledger_account')
export class LedgerAccount extends BaseEntity {
  @Column()
  name: string;
  
  // id, created_at, updated_at, deleted_at inherited from BaseEntity
}
```

**Use `MasterEntity` (from @common/entities/master.entity.ts) when:**
- Entity is a simple master/catalog table
- Only has `id` (INT PRIMARY KEY, not auto-increment) and `description`
- No audit fields needed
- Values are pre-seeded and rarely change

```typescript
// ✅ Correct - Simple master table
import { MasterEntity } from '@common/entities/master.entity';

@Entity('ledger_account_state')
export class LedgerAccountState extends MasterEntity {
  // id and description inherited from MasterEntity
}
```

### Entity Inheritance Decision Tree

```
Does entity have ONLY id + description (no other fields)?
  → YES → Use MasterEntity
  → NO  → Use BaseEntity (with id AUTO_INCREMENT + audit fields)
```

**Important:** ALL entities MUST extend either `BaseEntity` or `MasterEntity`. Plain entities without inheritance are NOT allowed.

### Common Mistakes

❌ **Using BaseEntity for simple master tables**:
```typescript
// WRONG - Unnecessarily complex
@Entity('status')
export class Status extends BaseEntity {
  @Column()
  description: string;
}
// Should use MasterEntity instead
```

❌ **Not extending BaseEntity when you need audit fields**:
```typescript
// WRONG - Missing audit capabilities and inheritance
@Entity('account_group')
export class AccountGroup {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  code: string;
}
// Should extend BaseEntity to get created_at, updated_at, deleted_at
```

❌ **Using custom primary keys instead of id**:
```typescript
// WRONG - Should use id as PK and code as UNIQUE
@Entity('ledger_account_class')
export class LedgerAccountClass {
  @PrimaryColumn({ length: 1 })
  code: string;
  
  @Column()
  description: string;
}
// Should extend BaseEntity with id as PK and code as UNIQUE column
```

✅ **Correct usage examples**:
```typescript
// Master table - MasterEntity (ONLY id + description)
@Entity('fiscal_category')
export class FiscalCategory extends MasterEntity {}

// Business entity with code - BaseEntity
@Entity('ledger_account_class')
export class LedgerAccountClass extends BaseEntity {
  @Column({ unique: true })
  code: string;
  
  @Column()
  description: string;
}

// Business entity with multiple fields - BaseEntity
@Entity('account_group')
export class AccountGroup extends BaseEntity {
  @Column({ unique: true })
  code: string;
  
  @Column()
  description: string;
  
  @Column()
  fromAccount: string;
  
  @Column()
  toAccount: string;
}
```

---

## Many-to-Many Relationship Rules

### When to Use @ManyToMany vs Explicit Pivot Entity

**Use `@ManyToMany` + `@JoinTable` ONLY when:**
- The pivot table has ONLY the two FKs and nothing else
- You are 100% certain it will never need extra fields
- It's a pure relationship with no business logic

**Use explicit pivot entity (BaseEntity with two `@ManyToOne`) when:**
- The pivot table has extra fields (timestamps, metadata, etc.)
- The pivot table might need extra fields in the future
- You need to track who/when records were created
- You need soft deletes on the relationship
- You need to query the relationship itself

### Best Practice for Production

**Prefer explicit pivot entity** even if today it has no extra fields:

```typescript
// ✅ RECOMMENDED - Explicit pivot entity
@Entity('files_ledger_account')
@Unique(['ledgerAccountId', 'fileId'])
export class FileLedgerAccount extends BaseEntity {
  @Column({ name: 'ledger_account_id' })
  ledgerAccountId: number;

  @ManyToOne(() => LedgerAccount, ledger => ledger.fileRelations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ledger_account_id' })
  ledgerAccount: LedgerAccount;

  @Column({ name: 'file_id' })
  fileId: number;

  @ManyToOne(() => File, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: File;

  // Future fields can be added easily:
  // @Column({ nullable: true })
  // uploadedBy?: number;
}

// Parent entity uses OneToMany
@Entity('ledger_account')
export class LedgerAccount extends BaseEntity {
  @OneToMany(() => FileLedgerAccount, fileRelation => fileRelation.ledgerAccount)
  fileRelations: FileLedgerAccount[];
}
```

```typescript
// ❌ NOT RECOMMENDED - @ManyToMany (harder to scale)
@Entity('ledger_account')
export class LedgerAccount extends BaseEntity {
  @ManyToMany(() => File)
  @JoinTable({
    name: 'files_ledger_account',
    joinColumn: { name: 'ledger_account_id' },
    inverseJoinColumn: { name: 'file_id' },
  })
  files: File[];
}
```

### Real-World Advantages of Explicit Pivot Entity

✅ **Total control** over the pivot table structure  
✅ **Better scalability** - easy to add fields later  
✅ **Easier to test** - can test pivot logic independently  
✅ **More expressive queries** - can filter/sort by pivot fields  
✅ **DDD/CQRS compatible** - pivot is a real domain entity  
✅ **Avoids TypeORM limitations** - no magic, full control

### Common Mistakes 🚨

❌ **Using @ManyToMany and creating pivot entity manually**
- TypeORM will conflict with your manual table

❌ **Trying to add columns to @ManyToMany later**
- Requires full refactor to explicit entity

❌ **Business logic "hidden" in magic relationships**
- Pivot entity makes relationships explicit and testable

### Migration Pattern

```typescript
// Explicit pivot table with BaseEntity structure
await queryRunner.query(`
  CREATE TABLE files_ledger_account (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ledger_account_id INT NOT NULL,
    file_id INT NOT NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,
    UNIQUE KEY unique_ledger_account_file (ledger_account_id, file_id),
    FOREIGN KEY (ledger_account_id) REFERENCES ledger_account(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES file(id) ON DELETE CASCADE
  )
`);
```

---

## Critical Patterns

### Pattern 1: Command Handler with Transaction

**CRITICAL: Use createEntity (not saveEntity) - save is implicit**

```typescript
@CommandHandler(CreateItemCommand)
export class CreateItemCommandHandler
  extends TransactionalHandler
  implements ICommandHandler<CreateItemCommand> {

  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly queryBus: QueryBus,
  ) {
    super();
  }

  async execute(command: CreateItemCommand): Promise<Item> {
    return this.executeTransactionalCommand(
      () => {
        return this.createItem(command);
      },
      [this.itemRepository],
      command.entityManager,
    );
  }

  private async createItem(command: CreateItemCommand): Promise<Item> {
    // Validate master data IDs (use QueryBus — do not inject a facade service)
    const masterData = await this.queryBus.execute(new GetItemMasterQuery());
    this.validateId(masterData.country, command.countryId, 'countryId');
    this.validateId(masterData.paymentConditions, command.paymentConditionsId, 'paymentConditionsId');
    this.validateId(masterData.societyResponse, command.societyId, 'societyId');

    // Create entity manually (not using mapper for better control)
    const item = new Item();
    item.mail = command.mail;
    item.countryId = command.countryId;
    item.societyId = command.societyId;
    item.stateId = ItemStatus.ACTIVE;
    
    // CRITICAL: Use createEntity (save is implicit)
    return await this.itemRepository.createEntity(item);
  }

  private validateId<T extends HasId>(array: T[], id: number, fieldName: string): void {
    const found = array.some((element) => element.id === id);
    if (!found) {
      throw new ConflictException(`invalid ${fieldName}`);
    }
  }
}

interface HasId {
  id: number;
}
```

### Pattern 2: Query Handler (No Transaction)

```typescript
@QueryHandler(GetAllResourcesQuery)export class GetAllResourcesQueryHandler
  implements IQueryHandler<GetAllResourcesQuery> {

  constructor(private readonly repository: ResourceRepository) {}

  async execute(query: GetAllResourcesQuery): Promise<ListResponseDto<ResourceDto>> {
    const { page = 1, limit = 10, categoryId } = query;

    const result = await this.repository.findAll(page, limit, {
      where: categoryId ? { categoryId } : {},
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });

    return {
      results: result.results.map(r => ResourceMapper.toResponseDto(r)),
      count: result.count,
      page: result.page,
      limit: result.limit,
    };
  }
}
```

### Pattern 4: Multi-Command Transactionexport class GetAllResourcesQueryHandler
  implements IQueryHandler<GetAllResourcesQuery> {

  constructor(private readonly repository: ResourceRepository) {}

  async execute(query: GetAllResourcesQuery): Promise<ListResponseDto<ResourceDto>> {
    const { page = 1, limit = 10, categoryId } = query;

    const result = await this.repository.findAll(page, limit, {
      where: categoryId ? { categoryId } : {},
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });

    return {
      results: result.results.map(r => ResourceMapper.toResponseDto(r)),
      count: result.count,
      page: result.page,
      limit: result.limit,
    };
  }
}
```

### Pattern 4: Multi-Command Transaction

```typescript
@Injectable()
export class ItemService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly unitOfWorkService: UnitOfWorkService,
  ) {}

  async createItem(
    createCommand: CreateItemCommand,
    files: Express.Multer.File[],
    userId: number,
  ): Promise<CreateItemResponseDto> {
    // CRITICAL: Initialize commands BEFORE withTransaction
    const uploadFilesCommand = new UploadFilesItemCommand();
    
    return await this.unitOfWorkService.withTransaction(async () => {
      try {
        // Commands receive entityManager automatically via array parameter
        const item: Item = await this.commandBus.execute(createCommand);
        const filesResponse = await this.handleFileUpload(uploadFilesCommand, item.id, files, userId);
        
        return { id: item.id, uploadResults: filesResponse };
      } catch (error) {
        throw new ConflictException(error);
      }
    }, [createCommand, uploadFilesCommand]); // Pass commands - entityManager set automatically
  }

  private async handleFileUpload(
    uploadCommand: UploadFilesCommand,
    entityId: number,
    files: Express.Multer.File[] = [],
    userId?: number,
  ): Promise<UploadResult[]> {
    uploadCommand.files = files;
    uploadCommand.entityId = entityId;
    uploadCommand.userId = userId;
    return this.commandBus.execute(uploadCommand);
  }
}
```

---

## Decision Tree

```
Controller action?
  → Write (POST/PATCH/DELETE)  → executeCommand(new Command(dto))
  → Read (GET)                 → executeQuery(new Query(dto))

Handler type?
  → Command (write)            → Extend TransactionalHandler
  → Query (read)               → Don't extend TransactionalHandler

Multiple commands?
  → Yes → Use UnitOfWorkService.withTransaction
    - Initialize commands FIRST
    - Pass array to withTransaction
    - Set entityManager on each
  → No  → Use executeTransactionalCommand in handler

Validation needed?
  → Create a static validator (pure function, no DB)
  → Query data in handler, pass to validator

Cross-module READ?
  → QueryBus (do not inject another module's repository to read)

Cross-module WRITE in the same unit of work (confirm-sale pattern)?
  → MAY inject the other module's exported repository and register it in the same TransactionalHandler / UoW
  → Do NOT claim that injecting another module's repository is always forbidden

Cross-module WRITE that is not atomic?
  → CommandBus (not a direct service import)

Handler needs read data inside a command?
  → Inject QueryBus and execute the appropriate Query (do NOT inject a module service that wraps QueryBus/CommandBus)

Data access from Service?
  → NEVER inject Repository in Service
  → Read data  → queryBus.execute(new GetXxxQuery(...))
  → Write data → commandBus.execute(new XxxCommand(...))
```

---

## BaseRepository Methods

All repositories extend `BaseRepository<T>`:

### Read Operations
```typescript
findAll(page, limit, options)                     // Paginated → ListResponseDto<T>
findAllWithoutPagination(options)                 // All → T[]
findById(id, select?, relations?)                 // Single by ID
findOneEntity(options)                            // Single with options
findByIds(ids, select?, relations?)               // Multiple by IDs
```

### Write Operations
```typescript
createEntity(entity)                              // Create single
createManyEntities(entities)                      // Create multiple
updateEntity(id, updates)                         // Update by ID
saveEntity(entity)                                // Save (create or update)
updateManyEntitiesByIds(ids, updates)             // Update multiple
deleteById(id)                                    // Delete by ID
```

---

## Module Setup

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

const repositories = [ResourceRepository];
const commands = [CreateResourceCommandHandler, UpdateResourceCommandHandler];
const queries = [GetAllResourcesQueryHandler, GetResourceByIdQueryHandler];
const services = [ResourceService];

@Module({
  imports: [
    TypeOrmModule.forFeature([Resource]),
    CqrsModule,  // Always import
  ],
  providers: [...repositories, ...commands, ...queries, ...services],
  controllers: [ResourceController],
  exports: [ResourceRepository],
})
export class ResourceModule {}
```

---

## Common Mistakes

❌ **Commands inside withTransaction**:
```typescript
// WRONG
withTransaction(async () => {
  const cmd = new Command();  // DON'T create here!
}, [cmd]); // cmd doesn't exist!
```

✅ **Commands before withTransaction**:
```typescript
// CORRECT
const cmd = new Command();
withTransaction(async () => { /* use cmd */ }, [cmd]);
```

❌ **Controller with business logic**:
```typescript
// WRONG
@Post()
async create(@Body() dto) {
  const existing = await this.repo.findBy({ name: dto.name });
  if (existing) throw new Error();
  return await this.repo.save(dto);
}
```

✅ **Controller routes to command**:
```typescript
// CORRECT
@Post()
async create(@Body() dto: CreateDto) {
  return this.executeCommand(new CreateCommand(dto));
}
```

❌ **Validator with repository**:
```typescript
// WRONG
class Validator {
  constructor(private repo: Repository) {}  // NO!
  async validate() { await this.repo.find(); } // NO!
}
```

✅ **Static validator**:
```typescript
// CORRECT
class Validator {
  static validate(command: Command, data: Data) {
    if (/* condition */) throw new ConflictException();
  }
}
```

❌ **Service calling Repository directly**:
```typescript
// WRONG - Service injects and calls repository
@Injectable()
export class MyService {
  constructor(private readonly myRepository: MyRepository) {}
  async getFiles(id: number) {
    return this.myRepository.getFilesByEntityId(id);  // NO!
  }
}
```

✅ **Service uses QueryBus to access data**:
```typescript
// CORRECT - Service delegates to QueryBus
@Injectable()
export class MyService {
  constructor(private readonly queryBus: QueryBus) {}
  async getFiles(id: number) {
    return this.queryBus.execute(new GetFilesByEntityIdQuery(id));
  }
}
```

❌ **Command handler injects an orchestration service**:
```typescript
// WRONG - Service uses CommandBus/QueryBus; handler depends on whole facade
constructor(private readonly myService: MyService) {}
```

✅ **Handler uses QueryBus for reads needed in the same use case**:
```typescript
// CORRECT
constructor(
  private readonly repository: MyRepository,
  private readonly queryBus: QueryBus,
) {}
const masterData = await this.queryBus.execute(new GetMasterDataQuery());
```

✅ **Atomic cross-module write (confirm-sale pattern)**:
```typescript
// CORRECT — both writes share the same unit of work
@CommandHandler(ConfirmSaleCommand)
export class ConfirmSaleHandler extends TransactionalHandler implements ICommandHandler<ConfirmSaleCommand> {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly stockRepository: StockRepository, // exported by the other module
  ) {
    super();
  }

  async execute(command: ConfirmSaleCommand): Promise<Sale> {
    return this.executeTransactionalCommand(
      async () => {
        const sale = await this.saleRepository.createEntity(/* ... */);
        await this.stockRepository.updateEntity(command.stockId, { reserved: true });
        return sale;
      },
      [this.saleRepository, this.stockRepository],
      command.entityManager,
    );
  }
}
```

❌ **Injecting another module's repository just to read**:
```typescript
// WRONG — cross-module reads go through QueryBus
constructor(private readonly otherModuleRepository: OtherRepository) {}
const data = await this.otherModuleRepository.findById(id);
```

❌ **Not setting entityManager**:
```typescript
// WRONG
withTransaction(async (em) => {
  await this.commandBus.execute(cmd);  // cmd has no entityManager!
}, [cmd]);
```

✅ **Set entityManager on commands**:
```typescript
// CORRECT
withTransaction(async (em) => {
  cmd.entityManager = em;
  await this.commandBus.execute(cmd);
}, [cmd]);
```

---

## Checklist

Before committing CQRS code:

- [ ] Controller extends `CqrsController`
- [ ] `.dto.ts` files used in `@Body()` for Swagger
- [ ] Commands/Queries in separate folders
- [ ] Handlers decorated with `@CommandHandler`/`@QueryHandler`
- [ ] Write handlers extend `TransactionalHandler`
- [ ] Query handlers DON'T extend `TransactionalHandler`
- [ ] Validators are static / pure (no DB)
- [ ] Response DTOs rely on the Swagger plugin; `@ApiProperty` only for enums, examples, nullable/union
- [ ] Mappers transform entities to DTOs
- [ ] Module imports `CqrsModule`
- [ ] Commands initialized BEFORE `withTransaction`
- [ ] Repository extends `BaseRepository`
- [ ] Services do NOT inject Repositories (use QueryBus/CommandBus instead)
- [ ] Cross-module reads use QueryBus; atomic cross-module writes MAY inject an exported repository (confirm-sale)
- [ ] Handlers do NOT inject orchestration services (use QueryBus/CommandBus for the operation needed)

---

## Resources

- **Controllers**: See [controllers skill](../controllers/SKILL.md) for controller creation patterns
- **Patterns**: See [assets/](assets/) for complete examples
- **Project Examples**: See [references/project-cqrs-examples.md](references/project-cqrs-examples.md)
- **Transactions**: See [assets/transaction-patterns.md](assets/transaction-patterns.md) for detailed patterns
- **Best Example**: See the example module in `src/modules/examples/` for basic patterns
- **BaseRepository**: `@persistence` package for repository methods
