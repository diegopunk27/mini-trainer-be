# Test Setup Template

**Pattern Template** - Basic E2E test structure for NestJS CQRS Base Template

## Complete Test Structure

```typescript
import { INestApplication } from '@nestjs/common';
import { setupTestingApp } from '@src/app.config';
import { setupTestingModule } from '@src/test.config';
import { validateAndTransformResponse } from '@src/test-utils/validate-and-transform-response';
import request from 'supertest';
import { In } from 'typeorm';

// Import your module
import { ResourceModule } from '../resource.module';
import { ResourceRepository } from '../repositories/resource.repository';
import { Resource } from '../entities/resource.entity';
import { ResourceResponseDto } from '../responses/resource.response.dto';

describe('ResourceController - {Endpoint}', () => {
  let app: INestApplication;
  let repository: ResourceRepository;
  const idsToDelete: number[] = [];

  beforeAll(async () => {
    // Setup testing module with required modules and mocks
    const { testingModule } = await setupTestingModule({
      modules: [ResourceModule], // Add all required modules
      mocks: [
        // Mock external services only
        {
          provide: ExternalService,
          useValue: {
            externalMethod: jest.fn().mockResolvedValue(mockResponse),
          }
        }
      ],
    });

    app = testingModule.createNestApplication();
    repository = testingModule.get<ResourceRepository>(ResourceRepository);
    // Get other repositories if needed

    setupTestingApp(app);
    await app.init();
  });

  describe('GET /resource', () => {
    it('should return 200 with paginated results', async () => {
      // Arrange - Prepare test data if needed

      // Act - Execute request
      const response = await request(app.getHttpServer())
        .get('/resource')
        .query({ page: 1, limit: 10 })
        .expect(200);

      // Assert - Validate response structure
      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('limit', 10);

      // Validate each item in results
      response.body.results.forEach(async (item: ResourceResponseDto) => {
        const isValid = await validateAndTransformResponse(ResourceResponseDto, item);
        expect(isValid).toBe(true);
      });
    });
  });

  describe('POST /resource', () => {
    it('should return 201 on successful creation', async () => {
      // Arrange - Prepare request data
      const requestData = {
        name: 'Test Resource',
        description: 'Test Description',
      };

      // Act - Execute request
      const response = await request(app.getHttpServer())
        .post('/resource')
        .send(requestData)
        .expect(201);

      // Assert - Validate response
      const body = response.body as ResourceResponseDto;
      const isValid = await validateAndTransformResponse(ResourceResponseDto, body);
      expect(isValid).toBe(true);

      // Save ID for cleanup
      idsToDelete.push(body.id);

      // Verify saved in database
      const savedEntity = await repository.findOneBy({ id: body.id });
      expect(savedEntity).not.toBeNull();
      expect(savedEntity.name).toBe(requestData.name);
    });

    it('should return 409 on business validation failure', async () => {
      // Arrange - Prepare invalid data
      const invalidData = {
        // Data that should fail business validation
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/resource')
        .send(invalidData)
        .expect(409);

      // Validate error message against constant
      expect(response.body.message).toBe(EXPECTED_ERROR_MESSAGE);
    });
  });

  afterAll(async () => {
    // Clean up all created data
    await repository.getEntityManager.delete(Resource, { id: In(idsToDelete) });
    await app.close();
  });
});
```

## Key Points

### 1. AAA Pattern
- **Arrange**: Prepare test data
- **Act**: Execute request
- **Assert**: Validate results

### 2. Setup
- Use `setupTestingModule()` with modules and mocks
- Mock external services only (not internal services/repositories)
- Initialize repositories for cleanup

### 3. Cleanup
- Track all created IDs in array
- Delete in `afterAll` using TypeORM's `In()` operator
- Respect foreign key constraints

### 4. Validation
- Use `validateAndTransformResponse()` for structure validation
- Only add specific value checks when needed
- Compare error messages against constants

### 5. Timeouts
- Default: 10000ms (10 seconds)
- Complex operations: 100000ms (100 seconds)

## Mock Example

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
};

// In setupTestingModule
mocks: [
  {
    provide: S3Service,
    useValue: mockS3Service,
  }
]
```

## Common Patterns

### Testing Pagination
```typescript
const response = await request(app.getHttpServer())
  .get('/resource')
  .query({ page: 1, limit: 10 })
  .expect(200);

// Validate ListResponseDto structure
expect(response.body).toHaveProperty('results');
expect(response.body).toHaveProperty('count');
expect(response.body).toHaveProperty('page', 1);
expect(response.body).toHaveProperty('limit', 10);
```

### Testing Error Cases
```typescript
it('should return 409 on duplicate', async () => {
  const response = await request(app.getHttpServer())
    .post('/resource')
    .send(duplicateData)
    .expect(409);

  // Use constants for error messages
  expect(response.body.message).toBe(ERROR_MESSAGES.DUPLICATE_KEY);
});
```

### Database Verification
```typescript
// Verify entity saved correctly
const savedEntity = await repository.findOneBy({ id: response.body.id });
expect(savedEntity).not.toBeNull();
expect(savedEntity.name).toBe(expectedValue);
```
