# Project Test Examples - Best Practices

This document references real test files in the project that demonstrate best practices.

## Items module E2E

**File**: `src/modules/items/controllers/item.controller.e2e.spec.ts`

**What it demonstrates**:
- `setupTestingModule` + `setupTestingApp`
- Creating an item via POST and listing it via GET
- Cleaning persisted rows in `afterAll`
- Asserting `ListResponseDto` shape (`results`, `count`)

**Key patterns**:
```typescript
const createResponse = await request(app.getHttpServer())
  .post('/items')
  .send({ name: 'Notebook' })
  .expect(201);

expect(createResponse.body.name).toBe('Notebook');

const listResponse = await request(app.getHttpServer()).get('/items').expect(200);
expect(listResponse.body.count).toBeGreaterThanOrEqual(1);
```

## JWT permissions on the example controller

**File**: `src/modules/examples/controllers/example.controller.e2e.spec.ts`

**What it demonstrates**:
- `mockUserService.setUser()` to impersonate a JWT user
- Hitting a guarded endpoint (`GET /example/profile`)
- Asserting the authenticated user (including permissions) comes back

```typescript
mockUserService.setUser({
  id: 1,
  email: 'admin@example.com',
  roleId: 1,
  roleName: 'ADMIN',
  permissions: ['example:read'],
});

const response = await request(app.getHttpServer()).get('/example/profile').expect(200);
expect(response.body).toMatchObject({
  id: 1,
  email: 'admin@example.com',
  permissions: ['example:read'],
});
```

## Testing CQRS Patterns

**Search for**: `*.e2e.spec.ts` files in `src/modules/*/controllers/`

**Key patterns to look for**:
- Testing commands (POST, PUT, DELETE endpoints)
- Testing queries (GET endpoints with pagination)
- Transaction testing (multiple operations that should rollback together)
- Error case testing (409, 400, 404 responses)
- Response structure validation with `validateAndTransformResponse`

## Testing Transactions

**Look for tests** that verify transaction rollback on failure:
- Create multiple entities in a transaction
- Force an error in the last step
- Verify NO entities were saved to database

## Testing Pagination

**Pattern**: All GET endpoints returning lists should validate ListResponseDto structure:
```typescript
expect(response.body).toHaveProperty('results');
expect(response.body).toHaveProperty('count');
expect(response.body).toHaveProperty('page');
expect(response.body).toHaveProperty('limit');
```

## Data Cleanup Patterns

**Look for**:
- Using arrays to track created IDs: `const idsToDelete: number[] = [];`
- Cleanup in `afterAll` using TypeORM's `In()` operator or `repository.clear()`
- Respecting foreign key constraints in deletion order

## Validation Testing

**What NOT to test**:
- ❌ class-validator decorators (@IsNotEmpty, @IsString, etc.)
- ❌ Required fields already validated by DTOs

**What TO test**:
- ✅ Business validations in handlers
- ✅ Static validators (pure functions, no DB)
- ✅ Cross-field validations
- ✅ Database constraint violations

## Finding More Examples

```bash
# Find all E2E tests
find src/modules -name "*.e2e.spec.ts"

# Find tests with JWT impersonation
grep -r "mockUserService.setUser" src/modules --include="*.spec.ts"

# Find transaction tests
grep -r "withTransaction" src/modules --include="*.spec.ts"
```

## Test Utilities

**Location**: `src/testing/` and `src/test-utils/`

Key utilities:
- `validateAndTransformResponse()` - Validate response structure
- `MockUserService` - Mock authentication
- `setupTestingModule()` - Configure test module
- `setupTestingApp()` - Apply app configuration

## Anti-Patterns to Avoid

Looking at existing tests, avoid:
- Testing class-validator decorators explicitly
- Mocking internal services/repositories
- Not cleaning up test data
- Mixing tests from different endpoints in one file
- Using literal strings for error messages (use constants)
- Duplicate structure validations after using validation utilities
