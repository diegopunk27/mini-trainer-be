# Transaction Patterns with UnitOfWorkService

## Critical Rule

**Commands MUST be initialized BEFORE `withTransaction` call**

This is the most common mistake in transaction management. All commands must be created and initialized before passing them to `withTransaction`.

## Pattern 1: Multi-Command Transaction

```typescript
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UnitOfWorkService } from '@persistence';

@Injectable()
export class ResourceService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly unitOfWorkService: UnitOfWorkService,
  ) {}

  async createResourceWithFiles(
    dto: CreateResourceDto,
    file: Express.Multer.File
  ): Promise<Resource> {
    // Step 1: Initialize ALL commands BEFORE withTransaction
    const processCommand = new CreateProcessCommand();
    processCommand.name = dto.name;
    processCommand.state = ProcessStateEnum.SUCCESS;

    const uploadFileCommand = new UploadFileCommand();
    uploadFileCommand.filename = file.originalname;
    uploadFileCommand.buffer = file.buffer;

    const createResourceCommand = new CreateResourceCommand();
    createResourceCommand.name = dto.name;
    createResourceCommand.categoryId = dto.categoryId;

    // Step 2: Execute transaction with initialized commands
    // withTransaction injects entityManager into each command. The callback
    // does not receive the manager as an argument.
    return await this.unitOfWorkService.withTransaction(async () => {
      const process = await this.commandBus.execute<Process>(processCommand);
      const uploadedFile = await this.commandBus.execute<File>(uploadFileCommand);

      createResourceCommand.fileId = uploadedFile.id;
      createResourceCommand.processId = process.id;

      return await this.commandBus.execute<Resource>(createResourceCommand);
    }, [processCommand, uploadFileCommand, createResourceCommand]);
  }
}
```

## Pattern 2: Transaction with Conditional Logic

```typescript
async createItemWithApproval(
  dto: CreateItemDto,
  user: UserDto
): Promise<Item> {
  // Initialize commands
  const createItemCommand = new CreateItemCommand(dto);
  const createApprovalCommand = new CreateApprovalCommand();

  return await this.unitOfWorkService.withTransaction(
    async (entityManager) => {
      // Execute first command
      const item = await this.commandBus.execute<Item>(createItemCommand);

      // Conditional logic inside transaction
      if (item.requiresApproval) {
        createApprovalCommand.itemId = item.id;
        createApprovalCommand.userId = user.id;
        await this.commandBus.execute<Approval>(createApprovalCommand);
      }

      return item;
    },
    [createItemCommand, createApprovalCommand]
  );
}
```

## Pattern 3: Transaction with Error Handling

```typescript
async createPayrollWithBackup(
  dto: CreatePayrollDto,
  file: Express.Multer.File
): Promise<Payroll> {
  // Initialize commands
  const processCommand = new CreateProcessCommand(dto.processName);
  const tempFileCommand = new UploadFileCommand(file, 'temp-bucket');
  const backupFileCommand = new UploadFileCommand(file, 'backup-bucket');
  const createPayrollCommand = new CreatePayrollCommand(dto);

  return await this.unitOfWorkService.withTransaction(
    async (entityManager) => {
      const process = await this.commandBus.execute<Process>(processCommand);

      let tempFile = null;
      let backupFile = null;

      try {
        // Upload to both buckets
        tempFile = await this.commandBus.execute<File>(tempFileCommand);
        backupFile = await this.commandBus.execute<File>(backupFileCommand);

        // Create payroll with file references
        createPayrollCommand.processId = process.id;
        createPayrollCommand.fileId = backupFile.id;

        return await this.commandBus.execute<Payroll>(createPayrollCommand);
      } catch (error) {
        // Cleanup uploaded files on error
        await this.cleanupFiles([tempFile, backupFile]);
        throw error; // Re-throw to trigger transaction rollback
      }
    },
    [processCommand, tempFileCommand, backupFileCommand, createPayrollCommand]
  );
}

private async cleanupFiles(files: (File | null)[]): Promise<void> {
  for (const file of files) {
    if (file) {
      await this.s3Service.deleteFile(file.key);
    }
  }
}
```

## Pattern 4: Split Transactions

Use separate transactions when operations should NOT share same transaction (e.g., to avoid deadlocks):

```typescript
async processResourceWorkflow(dto: ProcessDto): Promise<ProcessResult> {
  // Phase 1: Core creation (transactional)
  const createCommand = new CreateResourceCommand(dto);

  const resource = await this.unitOfWorkService.withTransaction(
    async (entityManager) => {
      createCommand.entityManager = entityManager;
      return await this.commandBus.execute<Resource>(createCommand);
    },
    [createCommand]
  );

  // Phase 2: Auto-approval (separate transaction to avoid deadlocks)
  if (resource.shouldAutoApprove) {
    const approvalCommand = new AutoApproveCommand({ resourceId: resource.id });

    await this.unitOfWorkService.withTransaction(
      async (entityManager) => {
        approvalCommand.entityManager = entityManager;
        return await this.commandBus.execute(approvalCommand);
      },
      [approvalCommand]
    );
  }

  return { resource };
}
```

## Pattern 5: Nested Transactions

When a command needs to call other commands in a transaction:

```typescript
// In Service
async complexOperation(dto: ComplexDto): Promise<Result> {
  const parentCommand = new ParentCommand(dto);

  return await this.unitOfWorkService.withTransaction(
    async (entityManager) => {
      // Pass entityManager to command
      parentCommand.entityManager = entityManager;
      return await this.commandBus.execute(parentCommand);
    },
    [parentCommand]
  );
}

// In ParentCommandHandler
@CommandHandler(ParentCommand)
export class ParentCommandHandler extends TransactionalHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly repository: Repository,
  ) {
    super();
  }

  async execute(command: ParentCommand): Promise<Result> {
    return this.executeTransactionalCommand(
      async () => {
        // This handler is already in a transaction from service
        // entityManager is passed through command.entityManager

        // Create child command with same entityManager
        const childCommand = new ChildCommand();
        childCommand.entityManager = command.entityManager;

        // Execute child command in same transaction
        await this.commandBus.execute(childCommand);

        // Continue with parent logic
        const entity = await this.repository.saveEntity({...});
        return entity;
      },
      [this.repository],
      command.entityManager // Pass through entityManager
    );
  }
}
```

## Anti-Patterns (DON'T DO THIS)

### ❌ Initializing Commands Inside withTransaction

```typescript
// WRONG - Commands initialized inside transaction
async badTransaction() {
  return await this.unitOfWorkService.withTransaction(
    async (entityManager) => {
      // BAD: Creating commands inside transaction
      const command1 = new Command1();  // Move this BEFORE withTransaction!
      const command2 = new Command2();  // Move this BEFORE withTransaction!

      await this.commandBus.execute(command1);
      await this.commandBus.execute(command2);
    },
    [command1, command2] // These variables don't exist in this scope!
  );
}
```

### ❌ Not Passing Commands Array

```typescript
// WRONG - Not passing commands array
return await this.unitOfWorkService.withTransaction(
  async (entityManager) => {
    await this.commandBus.execute(command);
  }
  // Missing commands array!
);
```

### ❌ Not Setting EntityManager

```typescript
// WRONG - Not setting entityManager on commands
return await this.unitOfWorkService.withTransaction(
  async (entityManager) => {
    // BAD: Commands don't have entityManager set
    await this.commandBus.execute(command1);
    await this.commandBus.execute(command2);
  },
  [command1, command2]
);

// CORRECT
return await this.unitOfWorkService.withTransaction(
  async (entityManager) => {
    command1.entityManager = entityManager;
    command2.entityManager = entityManager;
    await this.commandBus.execute(command1);
    await this.commandBus.execute(command2);
  },
  [command1, command2]
);
```

## When to Use Transactions

✅ **Use withTransaction when**:
- Multiple commands that must succeed/fail together
- Creating parent and child entities
- Operations that modify multiple tables
- File upload + database record creation

❌ **Don't use withTransaction when**:
- Single command operation (use executeTransactionalCommand in handler)
- Read-only queries
- Operations that can fail independently
- External API calls (they can't be rolled back)

## Real Project Example

See `src/modules/payroll/services/payroll.service.ts` method `createPayroll()` for a complete example of:
- Command initialization before withTransaction
- Multiple commands in single transaction
- Error handling with cleanup
- File upload + database operations
