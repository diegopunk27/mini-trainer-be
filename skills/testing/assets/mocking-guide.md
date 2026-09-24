# Mocking Guide - NestJS CQRS Base Template

## When to Mock

**DO Mock**:
- External services (AWS S3, external APIs)
- Third-party libraries that make network calls
- Services that depend on external resources

**DON'T Mock**:
- Internal CQRS handlers
- Repositories (test with real DB)
- Business logic
- DTOs and entities

## Mock Patterns

### External Service Mock

```typescript
const mockS3Service = {
  upload: jest.fn().mockResolvedValue({
    Location: 'https://example.com/file.txt',
    Key: 'folder/file.txt',
    Bucket: 'test-bucket'
  }),
  getObject: jest.fn().mockResolvedValue({
    Body: Buffer.from('file content')
  }),
  deleteObject: jest.fn().mockResolvedValue({}),
};

// In setupTestingModule
const { testingModule } = await setupTestingModule({
  modules: [ResourceModule],
  mocks: [
    {
      provide: S3Service,
      useValue: mockS3Service,
    }
  ],
});
```

### Verify Mock Calls

```typescript
// Verify mock was called
expect(mockS3Service.upload).toHaveBeenCalled();

// Verify with specific parameters
expect(mockS3Service.upload).toHaveBeenCalledWith(
  expect.objectContaining({
    Bucket: 'expected-bucket',
    Key: expect.stringContaining('expected-prefix'),
    Body: expect.any(Buffer),
  })
);

// Verify call count
expect(mockS3Service.upload).toHaveBeenCalledTimes(1);
```

### Mock User Authentication

```typescript
let mockUserService: MockUserService;

beforeAll(async () => {
  const { testingModule, mockUserService: userService } = await setupTestingModule({
    modules: [ResourceModule, AuthModule],
    mocks: [],
  });

  mockUserService = userService;

  // Set default user
  mockUserService.setUser({
    id: userId,
    email: 'test@example.com',
    rolId: RolesEnum.ADMINISTRADOR_GENERAL,
    rolDescription: 'Admin',
  });
});

// Change user role during tests
it('should test with different role', async () => {
  mockUserService.setUser({
    id: userId,
    email: 'security@example.com',
    rolId: RolesEnum.CIBERSEGURIDAD,
    rolDescription: 'Security',
  });

  // ... test code
});
```

### Mock Complex Responses

```typescript
const mockExternalApi = {
  fetchData: jest.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({ status: 'success', data: mockData });
    }
    return Promise.reject(new Error('Not found'));
  }),
};
```

### Reset Mocks Between Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks(); // Clear call history but keep implementation
});

// Or in specific test
it('should test something', async () => {
  mockS3Service.upload.mockReset(); // Reset implementation
  mockS3Service.upload.mockResolvedValue(newMockValue);

  // ... test code
});
```

## Common Mock Patterns

### AWS S3

```typescript
const mockS3Service = {
  upload: jest.fn().mockResolvedValue({
    Location: 'https://bucket.s3.region.amazonaws.com/key',
    Key: 'uploads/file.pdf',
    Bucket: 'test-bucket'
  }),
  getObject: jest.fn().mockResolvedValue({
    Body: Buffer.from('content'),
    ContentType: 'application/pdf'
  }),
};
```

### HTTP Client (Axios)

```typescript
const mockHttpService = {
  get: jest.fn().mockResolvedValue({
    data: { id: 1, name: 'Test' },
    status: 200,
  }),
  post: jest.fn().mockResolvedValue({
    data: { success: true },
    status: 201,
  }),
};
```

### Email Service

```typescript
const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
};
```

## Anti-Patterns

❌ **DON'T** mock internal services:
```typescript
// WRONG
{
  provide: ResourceService,
  useValue: { create: jest.fn() }
}
```

❌ **DON'T** mock repositories:
```typescript
// WRONG
{
  provide: ResourceRepository,
  useValue: { findById: jest.fn() }
}
```

❌ **DON'T** use jest.mock() at file level:
```typescript
// WRONG - Prefer setupTestingModule mocks
jest.mock('@aws-sdk/client-s3');
```

✅ **DO** use setupTestingModule for dependency injection:
```typescript
// CORRECT
const { testingModule } = await setupTestingModule({
  modules: [ResourceModule],
  mocks: [
    {
      provide: S3Service,
      useValue: mockS3Service,
    }
  ],
});
```

## Resources

- See `src/test-utils/mock-user.service.ts` for authentication mocking
- See `item-controller.e2e.spec.ts` for role-based testing examples
- See existing module tests for service mocking patterns
