# Testing - NestJS CQRS Base Template

---
name: testing
description: >
  Unit, integration, and E2E testing patterns for NestJS with CQRS. Trigger: When writing tests, creating test files, or testing CQRS handlers/controllers.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Writing E2E tests"
    - "Writing unit tests"
    - "Writing integration tests"
    - "Creating test files"
    - "Testing CQRS handlers"
    - "Testing controllers"
---

## When to Use

- Writing E2E tests for controllers
- Testing CQRS commands and queries
- Testing with role-based authentication
- Testing transactions and rollbacks
- Creating test files for new endpoints

---

## Critical Rules

1. **Complete Flow**: E2E tests MUST test from controller to response
2. **Mock External Only**: Mock AWS, external APIs - NOT internal services/repositories
3. **No class-validator Tests**: Don't test @IsNotEmpty, @IsString, etc. Test business validations and static validators (pure functions, no DB)
4. **Always Clean Up**: Delete all test data in `afterAll`
5. **AAA Pattern**: Arrange, Act, Assert in every test
6. **One File Per Endpoint**: Don't mix tests from different endpoints

## Mini-Trainer

- Dos organizaciones en el e2e de aislamiento: el token de A con ids de B responde 404.
- Las reservas concurrentes se prueban con `Promise.all` sobre la base real. Despues, el ledger cuadra: saldo = suma de deltas = ultimo `balance_after`.
- El reloj de los jobs es `ClockPort`.

---

## Critical Patterns

### Pattern 1: Test Structure

```typescript
describe('ResourceController - POST /resource', () => {
  let app: INestApplication;
  let repository: ResourceRepository;
  const idsToDelete: number[] = [];

  beforeAll(async () => {
    const { testingModule } = await setupTestingModule({
      modules: [ResourceModule],
      mocks: [{ provide: S3Service, useValue: mockS3 }],
    });
    app = testingModule.createNestApplication();
    repository = testingModule.get(ResourceRepository);
    setupTestingApp(app);
    await app.init();
  });

  it('should return 201 on successful creation', async () => {
    // Arrange
    const data = { name: 'Test' };

    // Act
    const response = await request(app.getHttpServer())
      .post('/resource')
      .send(data)
      .expect(201);

    // Assert
    const isValid = await validateAndTransformResponse(ResourceDto, response.body);
    expect(isValid).toBe(true);
    idsToDelete.push(response.body.id);
  });

  afterAll(async () => {
    await repository.getEntityManager.delete(Resource, { id: In(idsToDelete) });
    await app.close();
  });
});
```

### Pattern 2: Role-Based Testing

```typescript
let mockUserService: MockUserService;

beforeAll(async () => {
  const { testingModule, mockUserService: userService } = await setupTestingModule({
    modules: [ResourceModule, AuthModule],
  });
  mockUserService = userService;
});

it('returns the authenticated user on GET /example/profile', async () => {
  mockUserService.setUser({
    id: 1,
    email: 'admin@example.com',
    roleId: 1,
    roleName: 'ADMIN',
    permissions: ['example:read'],
  });

  const response = await request(app.getHttpServer()).get('/example/profile').expect(200);
  expect(response.body.permissions).toContain('example:read');
});

it('returns 403 without the required permission', async () => {
  mockUserService.setUser({
    id: 2,
    email: 'viewer@example.com',
    roleId: 2,
    roleName: 'VIEWER',
    permissions: [],
  });
  await request(app.getHttpServer()).get('/example/profile').expect(403);
});
```

### Pattern 3: Pagination Validation

```typescript
it('should return paginated results', async () => {
  const response = await request(app.getHttpServer())
    .get('/resource')
    .query({ page: 1, limit: 10 })
    .expect(200);

  // ListResponseDto structure from @persistence
  expect(response.body).toHaveProperty('results');
  expect(response.body).toHaveProperty('count');
  expect(response.body).toHaveProperty('page', 1);
  expect(response.body).toHaveProperty('limit', 10);
});
```

### Pattern 4: Transaction Testing

```typescript
it('should rollback on transaction failure', async () => {
  const data = { /* data that will cause error on last step */ };

  await request(app.getHttpServer())
    .post('/resource')
    .send(data)
    .expect(409);

  // Verify NO data was saved
  const process = await processRepository.findOneBy({ name: data.processName });
  const file = await fileRepository.findOneBy({ name: data.fileName });
  expect(process).toBeNull();
  expect(file).toBeNull();
});
```

---

## Decision Tree

```
Testing endpoint?              → Create {endpoint-name}.e2e.spec.ts
Need role-based auth?          → Use mockUserService.setUser()
Testing external service?      → Mock in setupTestingModule
Testing internal logic?        → DON'T mock, test real implementation
Need to validate structure?    → Use validateAndTransformResponse()
Testing pagination?            → Validate ListResponseDto structure
Testing error case?            → Compare against error constants
Testing transaction?           → Verify rollback on failure
```

---

## Prior Analysis (MANDATORY)

Before writing tests:

1. **Identify all endpoints** in controller
2. **For each endpoint**:
   - Associated command/query handler
   - All code branches
   - Business validations (NOT class-validator)
   - Possible errors/exceptions
3. **Design test cases**:
   - Happy path
   - Error cases (409, 400, 401)
   - Edge cases
4. **Create structure**:
   - `tests/` folder inside controller folder
   - One `.e2e.spec.ts` file per endpoint
   - kebab-case names

---

## Common Mistakes

❌ **Testing class-validator**: Don't test @IsNotEmpty, @IsString
✅ **Test business validations**: Custom validators, cross-field checks

❌ **Mocking repositories**: Don't mock ResourceRepository
✅ **Test with real DB**: Use test database

❌ **Literal error messages**: `expect(error).toBe('Duplicate key')`
✅ **Use constants**: `expect(error).toBe(ERROR_MESSAGES.DUPLICATE_KEY)`

❌ **No cleanup**: Leaving test data in database
✅ **Always cleanup**: Delete in afterAll with In(idsToDelete)

❌ **Duplicate validations**: Manual checks after validateAndTransformResponse
✅ **Trust utilities**: validateAndTransformResponse checks full structure

---

## Commands

```bash
npm run test:e2e                          # All E2E tests
npm run test:e2e -- resource.e2e.spec.ts  # Specific test
npm run test:e2e:cov                      # With coverage
npm run test:unit                         # Unit tests
```

---

## Resources

- **Templates**: See [assets/](assets/) for test templates and examples
- **Project Examples**: See [references/project-test-examples.md](references/project-test-examples.md)
- **Mocking Guide**: See [assets/mocking-guide.md](assets/mocking-guide.md)
- **Test Utilities**: `src/test-utils/` (validateAndTransformResponse, MockUserService)
- **Best Example**: `src/modules/items/controllers/item.controller.e2e.spec.ts`
