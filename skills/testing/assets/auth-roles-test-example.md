# Authentication & Role-Based Testing

**Pattern Template** - Testing with different user roles using MockUserService

Based on: `item-controller.e2e.spec.ts`

## Basic Role-Based Test Setup

```typescript
import { INestApplication } from '@nestjs/common';
import { RolesEnum } from '@roles/enums/roles-enum';
import { setupTestingApp } from '@src/app.config';
import { MockUserService } from '@src/test-utils/mock-user.service';
import { setupTestingModule } from '@src/test.config';
import request from 'supertest';

describe('Role-Based Test Example', () => {
  let app: INestApplication;
  let mockUserService: MockUserService;
  let userId: number;

  beforeAll(async () => {
    // Setup with MockUserService
    const { testingModule, mockUserService: userService } = await setupTestingModule({
      modules: [/* Your modules */],
      mocks: [],
    });

    app = testingModule.createNestApplication();
    mockUserService = userService;

    // Setup initial test user
    mockUserService.setUser({
      id: userId,
      email: 'test@example.com',
      rolId: RolesEnum.ADMINISTRADOR_GENERAL,
      rolDescription: 'Admin',
    });

    setupTestingApp(app);
    await app.init();
  });

  // Tests here...
});
```

## Pattern 1: Testing Workflow with Role Transitions

```typescript
it('should handle workflow with role transitions', async () => {
  // Step 1: Create resource as ADMIN
  mockUserService.setUser({
    id: userId,
    email: 'admin@example.com',
    rolId: RolesEnum.ADMINISTRADOR_GENERAL,
    rolDescription: 'Admin',
  });

  const createResponse = await request(app.getHttpServer())
    .post('/resource')
    .send({ name: 'Test Resource' })
    .expect(201);

  const resourceId = createResponse.body.id;

  // Step 2: Approve as CIBERSEGURIDAD
  mockUserService.setUser({
    id: userId,
    email: 'security@example.com',
    rolId: RolesEnum.CIBERSEGURIDAD,
    rolDescription: 'Security',
  });

  const approveResponse = await request(app.getHttpServer())
    .post(`/resource/approve/${resourceId}`)
    .expect(201);

  expect(approveResponse.body.status).toBe('PENDING_CEO');

  // Step 3: Final approval as CEO
  mockUserService.setUser({
    id: userId,
    email: 'ceo@example.com',
    rolId: RolesEnum.CEO,
    rolDescription: 'CEO',
  });

  const finalApproval = await request(app.getHttpServer())
    .post(`/resource/approve/${resourceId}`)
    .expect(201);

  expect(finalApproval.body.status).toBe('APPROVED');
}, 120000);
```

## Pattern 2: Testing Unauthorized Access

```typescript
it('should return 401 when role is not authorized', async () => {
  // Create resource as ADMIN
  mockUserService.setUser({
    id: userId,
    email: 'admin@example.com',
    rolId: RolesEnum.ADMINISTRADOR_GENERAL,
    rolDescription: 'Admin',
  });

  const createResponse = await request(app.getHttpServer())
    .post('/resource')
    .send({ name: 'Test Resource' })
    .expect(201);

  // Try to approve with wrong role (CFO instead of CIBERSEGURIDAD)
  mockUserService.setUser({
    id: userId,
    email: 'cfo@example.com',
    rolId: RolesEnum.CFO,
    rolDescription: 'CFO',
  });

  await request(app.getHttpServer())
    .post(`/resource/approve/${createResponse.body.id}`)
    .expect(401);
});
```

## Pattern 3: Testing SUPER_USUARIO Permissions

```typescript
it('SUPER_USUARIO should bypass role restrictions', async () => {
  mockUserService.setUser({
    id: userId,
    email: 'super@example.com',
    rolId: RolesEnum.SUPER_USUARIO,
    rolDescription: 'Super User',
  });

  // Super user can perform actions regardless of workflow state
  const response = await request(app.getHttpServer())
    .post('/resource/approve/any-id')
    .expect(201);

  expect(response.body).toBeDefined();
});
```

## Pattern 4: Testing ADMINISTRADOR_GENERAL Bypass

```typescript
it('ADMINISTRADOR_GENERAL should bypass workflow restrictions', async () => {
  mockUserService.setUser({
    id: userId,
    email: 'admin@example.com',
    rolId: RolesEnum.ADMINISTRADOR_GENERAL,
    rolDescription: 'Admin',
  });

  const createResponse = await request(app.getHttpServer())
    .post('/resource')
    .send({ name: 'Test' })
    .expect(201);

  // ADMIN can approve at any stage
  const approveResponse = await request(app.getHttpServer())
    .post(`/resource/approve/${createResponse.body.id}`)
    .expect(201);

  expect(approveResponse.body.status).toBe('APPROVED');
});
```

## Pattern 5: File Upload with Role

```typescript
it('should store userId in File entity when uploading files', async () => {
  mockUserService.setUser({
    id: userId,
    email: 'security@example.com',
    rolId: RolesEnum.CIBERSEGURIDAD,
    rolDescription: 'Security',
  });

  // Create test file
  const testFile = Buffer.from('File content');

  // Upload file with role
  const approvalRequest = request(app.getHttpServer())
    .post(`/resource/approve/${resourceId}`);

  approvalRequest.attach('files', testFile, 'approval-document.pdf');

  const response = await approvalRequest.expect(201);

  // Verify file was created with correct userId
  const files = await fileRepository.findBy({ resourceId: response.body.id });
  expect(files.every(f => f.userId === userId)).toBe(true);
}, 120000);
```

## Common Roles in System

```typescript
enum RolesEnum {
  ADMINISTRADOR_GENERAL = 1,
  SUPER_USUARIO = 2,
  CIBERSEGURIDAD = 3,
  CEO = 4,
  CFO = 5,
  DATOS_MAESTROS = 6,
  ACCOUNTING_OF_CONTABILITY = 7,
}
```

## Key Points

1. **Use mockUserService.setUser()** to change roles during tests
2. **Test all workflow states** with appropriate roles
3. **Test unauthorized access** (401 errors)
4. **Test bypass roles** (ADMINISTRADOR_GENERAL, SUPER_USUARIO)
5. **Verify userId** stored correctly in database
6. **Use realistic timeouts** (120000ms for complex workflows)

## Real Example Reference

See `src/modules/items/controllers/tests/item-controller.e2e.spec.ts` for:
- Complete approval workflow with multiple roles
- Role-based state transitions
- File upload with userId tracking
- Unauthorized access testing
- ADMINISTRADOR_GENERAL bypass testing
