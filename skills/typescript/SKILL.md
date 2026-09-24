# TypeScript Best Practices - NestJS CQRS Base

---
name: typescript
description: >
  TypeScript strict patterns and best practices for NestJS CQRS Base. Trigger: When implementing or refactoring TypeScript in .ts files (types, interfaces, generics, removing any, tightening unknown).
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Writing TypeScript types/interfaces"
    - "Refactoring TypeScript code"
    - "Creating DTOs or entities"
---

## Critical Patterns

### Always Declare Types (Mandatory)

- **ALL** function parameters and return values MUST have explicit types
- **ALL** variables MUST have declared types (except where type inference is obvious from literal assignment)
- **AVOID** `any` type at all costs
- Create necessary types/interfaces when needed
- Use `unknown` for truly unknown types with type guards

**Example:**
```typescript
// ✅ Correct
function processData(input: string): Promise<User> {
  // logic
}

const user: User = { id: 1, name: 'John' };

// ✅ Acceptable - type inference from literal
const config = { apiUrl: 'https://api.example.com' };

// ❌ Incorrect
function processData(input): any {
  // logic
}

const user = getUserData(); // Type not declared
```

## Const Types Pattern (REQUIRED)

```typescript
// ✅ ALWAYS: Create const object first, then extract type
const PROCESS_STATUS = {
  PENDING: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  FAILED: 4,
} as const;

type ProcessStatus = (typeof PROCESS_STATUS)[keyof typeof PROCESS_STATUS];

// For string enums
const PAYMENT_TYPE = {
  CREDIT_CARD: "credit_card",
  DEBIT_CARD: "debit_card",
  TRANSFER: "transfer",
} as const;

type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];

// ❌ NEVER: Direct union types without const source
type ProcessStatus = 1 | 2 | 3 | 4;
```

**Why?** Single source of truth, runtime values, autocomplete, easier refactoring.

## Flat Interfaces (REQUIRED)

```typescript
// ✅ ALWAYS: One level depth, nested objects → dedicated interface
interface ItemAddress {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

interface Item {
  id: number;
  name: string;
  email: string;
  address: ItemAddress;  // Reference, not inline
}

interface RegisteredItem extends Item {
  registrationDate: Date;
  status: ItemStatus;
}

// ❌ NEVER: Inline nested objects
interface Item {
  id: number;
  name: string;
  address: {
    street: string;
    city: string;
  };  // NO!
}
```

## Never Use `any`

```typescript
// ✅ Use unknown for truly unknown types
function parseJson(input: unknown): User {
  if (isUser(input)) return input;
  throw new ConflictException("Invalid input");
}

// ✅ Use generics for flexible types
function getById<T>(repository: BaseRepository<T>, id: number): Promise<T | null> {
  return repository.findOneBy({ id });
}

// ✅ Use proper type guards
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}

// ❌ NEVER
function parseJson(input: any): any {
  return JSON.parse(input);
}
```

## Utility Types

TypeScript provides powerful utility types - use them instead of creating manual types:

```typescript
// Built-in Utility Types
Pick<User, "id" | "name">     // Select specific fields
Omit<User, "password">         // Exclude fields
Partial<User>                  // All fields optional
Required<User>                 // All fields required
Readonly<User>                 // All fields readonly
Record<string, User>           // Object with string keys
Extract<Union, "a" | "b">      // Extract from union
Exclude<Union, "a">            // Exclude from union
NonNullable<T | null>          // Remove null/undefined
ReturnType<typeof fn>          // Function return type
Parameters<typeof fn>          // Function params tuple

// Practical examples for our project
type UpdateItemDto = Partial<CreateItemDto>;
type ItemSummary = Pick<Item, "id" | "name" | "status">;
type ItemWithoutPassword = Omit<Item, "password">;
```

## Type Guards

Type guards are essential for working with `unknown` types safely:

```typescript
// ✅ Basic type guard
function isItem(value: unknown): value is Item {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value
  );
}

// ✅ Type guard with validation
function isValidProcessState(value: unknown): value is ProcessStateEnum {
  return (
    typeof value === "number" &&
    Object.values(ProcessStateEnum).includes(value)
  );
}

// Usage
function processData(input: unknown): void {
  if (isItem(input)) {
    // TypeScript knows input is Item here
    console.log(input.name);
  }
}
```

## Import Types

Use `type` imports when importing only types (not runtime values):

```typescript
// ✅ Correct - importing only types
import type { User, Item } from "./types";
import type { CreateUserCommand } from "./commands";

// ✅ Correct - mixing types and runtime values
import { UserRepository, type User } from "./user";
import { createUser, type CreateUserConfig } from "./utils";

// ❌ Avoid - importing types as regular imports when not needed at runtime
import { User, Item } from "./types";
```

## Enums vs Const Types

### When to Use Numeric Enums

Use numeric enums for database-backed values (status IDs, type IDs, etc.):

```typescript
// ✅ Numeric enums for database values
export enum ProcessStateEnum {
  PENDING = 1,
  IN_PROGRESS = 2,
  SUCCESS = 3,
  FAILED = 4,
}

export enum ItemStatusEnum {
  PENDING_APPROVAL = 1,
  APPROVED = 2,
  REJECTED = 3,
  INACTIVE = 4,
}
```

### When to Use Const Types

Use const types for string literals or when you need runtime values:

```typescript
// ✅ Const types for string literals
const FILE_TYPE = {
  PDF: "pdf",
  EXCEL: "excel",
  WORD: "word",
} as const;

type FileType = (typeof FILE_TYPE)[keyof typeof FILE_TYPE];

// ✅ Access runtime values
const allowedTypes = Object.values(FILE_TYPE); // ["pdf", "excel", "word"]
```

## Function Signatures

### Explicit Return Types (Mandatory)

```typescript
// ✅ Correct
async function getItem(id: number): Promise<Item | null> {
  return this.repository.findOneBy({ id });
}

function calculateTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0);
}

// ❌ Incorrect - missing return type
async function getItem(id: number) {
  return this.repository.findOneBy({ id });
}
```

### Parameter Objects (RO-RO Pattern)

For functions with multiple parameters, use objects:

```typescript
// ✅ Correct - using object parameter
interface CreateItemParams {
  name: string;
  email: string;
  countryId: number;
  categoryId: number;
}

function createItem(params: CreateItemParams): Promise<Item> {
  // logic
}

// Usage
createItem({
  name: "ACME Corp",
  email: "contact@acme.com",
  countryId: 1,
  categoryId: 2,
});

// ❌ Avoid - too many parameters
function createItem(
  name: string,
  email: string,
  countryId: number,
  categoryId: number
): Promise<Item> {
  // logic
}
```

## Naming Conventions

Follow these naming conventions consistently:

```typescript
// PascalCase for classes, interfaces, types, enums
class ItemService {}
interface User {}
type PaymentMethod = "card" | "transfer";
enum ProcessState {}

// camelCase for variables, functions, methods
const userName = "John";
function getUserById(id: number) {}
async updateItem(id: number, data: UpdateItemDto) {}

// UPPERCASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = "https://api.example.com";

// kebab-case for file and directory names
// item-service.ts
// create-item.command.ts
// item.repository.ts
```

## Readonly and Immutability

### Use readonly for Immutable Data

```typescript
// ✅ Readonly properties
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// ✅ Readonly arrays
const ALLOWED_COUNTRIES: readonly string[] = ["CL", "PE", "AR", "CO"];

// ✅ as const for literal objects
const ERROR_MESSAGES = {
  NOT_FOUND: "Resource not found",
  INVALID_INPUT: "Invalid input provided",
} as const;

// ✅ Readonly class properties
class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly maxAttempts = 3;
}
```

## Generics

Use generics for reusable, type-safe code:

```typescript
// ✅ Generic repository method
class BaseRepository<T> {
  async findById(id: number): Promise<T | null> {
    // logic
  }

  async findAll(): Promise<T[]> {
    // logic
  }
}

// ✅ Generic response wrapper
interface ListResponseDto<T> {
  results: T[];
  count: number;
  page: number;
  limit: number;
}

// ✅ Generic utility function
function mapToDto<TEntity, TDto>(
  entities: TEntity[],
  mapper: (entity: TEntity) => TDto
): TDto[] {
  return entities.map(mapper);
}
```

## Avoid Type Assertions

Prefer type guards over type assertions:

```typescript
// ✅ Correct - using type guard
function processUser(data: unknown): void {
  if (isUser(data)) {
    console.log(data.name); // TypeScript knows data is User
  }
}

// ⚠️ Use sparingly - type assertion
const user = data as User;

// ❌ Never - double assertion
const user = data as unknown as User;
```

## Async/Await Patterns

### Always Type Async Functions

```typescript
// ✅ Correct
async function getUsers(): Promise<User[]> {
  return this.repository.findAll();
}

async function processPayment(amount: number): Promise<void> {
  await this.paymentService.process(amount);
}

// ❌ Incorrect - missing Promise return type
async function getUsers() {
  return this.repository.findAll();
}
```

### Parallel vs Sequential Operations

```typescript
// ✅ Parallel operations with Promise.all
async function getMasterData(): Promise<MasterDataDto> {
  const [countries, categories, statuses] = await Promise.all([
    this.countryRepository.findAll(),
    this.categoryRepository.findAll(),
    this.statusRepository.findAll(),
  ]);

  return { countries, categories, statuses };
}

// ✅ Sequential operations when order matters
async function createItemWithApproval(dto: CreateItemDto): Promise<Item> {
  const item = await this.itemRepository.save(dto);
  const approval = await this.approvalService.createApproval(item.id);
  item.approval = approval;
  return item;
}
```

## TypeScript Project Configuration

Our `tsconfig.json` should enforce strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Common Anti-Patterns

```typescript
// ❌ Using any
function processData(data: any): any {
  return data;
}

// ❌ Implicit any
function processData(data) {
  return data;
}

// ❌ Type assertion instead of type guard
const user = data as User;

// ❌ Inline nested types
interface User {
  address: { street: string; city: string };
}

// ❌ Direct union types without const source
type Status = "pending" | "approved" | "rejected";

// ❌ Missing return types
async function getData() {
  return fetch('/api/data');
}

// ❌ Using non-null assertion operator (!)
const value = possiblyNull!.property;
```

## Resources

For more information on TypeScript best practices:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [NestJS TypeScript Guidelines](https://docs.nestjs.com/)

---

**Note**: These TypeScript rules are enforced by ESLint and the TypeScript compiler. Code that violates these rules will fail the pre-commit hook.
