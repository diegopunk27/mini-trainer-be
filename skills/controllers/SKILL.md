# NestJS Controllers Documentation - NestJS CQRS Base Template

---
name: controllers
description: >
  Controller creation patterns, Swagger documentation, and endpoint implementation. Trigger: When creating or modifying controllers, documenting API endpoints, or implementing HTTP routes.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Creating controllers"
    - "Creating API endpoints"
    - "Documenting API endpoints"
    - "Implementing HTTP routes"
---

## When to Use

Use this skill when:
- Creating new controllers
- Adding new HTTP endpoints
- Documenting API endpoints with Swagger
- Implementing GET, POST, PATCH, DELETE operations
- Creating paginated GET endpoints
- Adding request/response validation

---

## Critical Rules

1. **Controllers MUST extend `CqrsController`**
2. **Use `.dto.ts` files for request/response DTOs** - the Swagger plugin auto-documents from these files
3. **`@ApiProperty` only for enums, examples, and nullable or union types** - do not decorate every field
4. **Add class-validator decorators for validation** - Enables Jest/testing validation
5. **Use `.dto.ts` files ONLY in `@Body()`** - Not in params, queries, or responses
6. **POST, PATCH, DELETE → `executeCommand()`** - Write operations
7. **GET → `executeQuery()`** - Read operations
8. **Paginated GET → Add `@ApplySwaggerPaginationResponse(DtoClass)`** - Custom pagination decorator
9. **Add `@ApiTags()` at class level** - Swagger groups endpoints by resource

---

## Understanding Swagger Auto-Documentation

**Key Insight:** Response (and request) DTOs rely on the NestJS Swagger plugin. It infers schema from the class and from `class-validator`. Add `@ApiProperty` / `@ApiPropertyOptional` **only** for enums, examples, and nullable or union types. Do not put `@ApiProperty` on every field.

### How It Works

```
1. Create DTO with .dto.ts extension
   ↓
2. Add class-validator decorators (@IsString, @IsNotEmpty, etc.)
   ↓
3. Add @ApiProperty only for enums, examples, nullable or union types
   ↓
4. Use DTO in @Body() of controller method
   ↓
5. The Swagger plugin generates request/response schema
```

---

## DTO Patterns

### Request DTO (Input)

```typescript
// ✅ Correct - Named with .dto.ts extension
// src/modules/item/dto/create-item.dto.ts

import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemRequestDto {
  @ApiProperty({
    description: 'Item company name',
    example: 'ACME Corp',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'contact@acme.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Country identifier',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  countryId: number;

  @ApiProperty({
    description: 'Optional phone number',
    example: '+56912345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
```

### Response DTO (Output)

```typescript
// ✅ Correct - Named with .response.dto.ts extension
// src/modules/item/responses/item.response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class ItemResponseDto {
  @ApiProperty({
    description: 'Unique item identifier',
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'Item company name',
    example: 'ACME Corp',
  })
  name: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'contact@acme.com',
  })
  email: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;
}
```

### Query DTO (GET parameters)

```typescript
// ✅ Correct - For GET endpoints with filters/pagination
// src/modules/item/dto/get-items.query.dto.ts

import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetItemsQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    example: 10,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({
    description: 'Filter by item name',
    example: 'ACME',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
```

---

## Controller Patterns

### Pattern 1: Basic Controller (POST and GET)

```typescript
// ✅ Correct - Matches items.controller.ts example
// src/modules/item/controllers/item.controller.ts

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CqrsController, CommandBus, QueryBus } from '@cqrs';
import { CreateItemRequestDto } from '../dto/create-item.dto';
import { ItemResponseDto } from '../responses/item.response.dto';
import { CreateItemCommand } from '../commands/create-item.command';
import { GetItemsQuery } from '../queries/get-items.query';
import { JWTPermissionsGuard } from '@auth';

@ApiTags('Items')
@Controller('items')
@ApiBearerAuth()
export class ItemController extends CqrsController {
  constructor(
    readonly commandBus: CommandBus,
    readonly queryBus: QueryBus,
  ) {
    super(commandBus, queryBus);
  }

  @Get()
  @UseGuards(JWTPermissionsGuard)
  async getItems(): Promise<ItemResponseDto[]> {
    // Returns array - NO pagination decorator needed
    return this.executeQuery(new GetItemsQuery());
  }

  @Post()
  @UseGuards(JWTPermissionsGuard)
  async createItem(@Body() dto: CreateItemRequestDto): Promise<ItemResponseDto> {
    // Swagger auto-documents from CreateItemRequestDto
    return this.executeCommand(new CreateItemCommand(dto));
  }
}
```

### Pattern 2: Paginated GET Endpoint

**CRITICAL:** Only use `@ApplySwaggerPaginationResponse()` decorator for paginated GET endpoints.

```typescript
// ✅ Correct - Paginated GET with custom decorator
// Matches getItems in items.controller.ts

import { Query } from '@nestjs/common';
import { ApplySwaggerPaginationResponse } from '@common/decorators/apply-swagger-pagination-response.decorator';
import { ListResponseDto } from '@persistence';

@Get()
@UseGuards(JWTPermissionsGuard)
@ApplySwaggerPaginationResponse(ItemResponseDto)  // ← Custom decorator for pagination
async getItems(@Query() query: GetItemsQueryDto): Promise<ListResponseDto<ItemResponseDto>> {
  // Returns paginated ListResponseDto<T>
  return this.executeQuery(new GetItemsQuery(query));
}
```

**When to use `@ApplySwaggerPaginationResponse`:**
- The endpoint returns `ListResponseDto<T>` (paginated response)
- The response includes `items: T[]`, `total: number`, `page: number`, etc.
- Use the Response DTO class as the decorator parameter

### Pattern 3: Full Controller with Multiple Operations

```typescript
// ✅ Correct - Complete controller example
// src/modules/items/controllers/items.controller.ts

import { Body, Controller, Get, Post, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CqrsController, CommandBus, QueryBus } from '@cqrs';
import { JWTPermissionsGuard, ApiKeyGuard } from '@auth';
import { ApplySwaggerPaginationResponse } from '@common/decorators/apply-swagger-pagination-response.decorator';
import { ListResponseDto } from '@persistence';

// DTOs
import { CreateItemRequestDto } from '../dto/create-items.dto';
import { GetItemsQueryDto } from '../dto/get-itemss.query.dto';
import { ItemResponseDto } from '../responses/items.response.dto';

// Commands & Queries
import { CreateItemCommand } from '../commands/create-items.command';
import { GetItemsQuery } from '../queries/get-itemss.query';

@ApiTags('AMOS Item')
@Controller('items')
@ApiBearerAuth()
export class ItemController extends CqrsController {
  constructor(
    readonly queryBus: QueryBus,
    readonly commandBus: CommandBus,
  ) {
    super(queryBus, commandBus);
  }

  // ✅ Paginated GET - Uses @ApplySwaggerPaginationResponse
  @Get()
  @UseGuards(JWTPermissionsGuard)
  @ApplySwaggerPaginationResponse(ItemResponseDto)
  async getItems(
    @Query() query: GetItemsQueryDto,
  ): Promise<ListResponseDto<ItemResponseDto>> {
    return this.executeQuery(new GetItemsQuery(query));
  }

  // ✅ POST - Uses DTO for auto-documentation, NO decorator needed
  @Post()
  @UseGuards(ApiKeyGuard)
  async createItem(
    @Body() dto: CreateItemRequestDto,
  ): Promise<ItemResponseDto> {
    return this.executeCommand(new CreateItemCommand(dto));
  }
}
```

---

## Swagger Documentation Details

### What Gets Auto-Documented

When you use `.dto.ts` files, the Swagger plugin generates the following:

✅ **Automatically Generated:**
- Request body schema
- Response body schema
- Required vs optional fields
- Field types and examples
- Field descriptions

❌ **NOT Auto-Documented (requires additional decorators):**
- HTTP status codes (add `@ApiResponse()`)
- Operation summary (add `@ApiOperation()`)
- Error responses (add `@ApiResponse()` for each error)

### Adding Status Codes and Error Documentation

```typescript
import { ApiResponse, ApiOperation } from '@nestjs/swagger';

@Post()
@ApiOperation({ summary: 'Create a new item' })
@ApiResponse({
  status: 201,
  description: 'Item created successfully',
  type: ItemResponseDto,
})
@ApiResponse({
  status: 400,
  description: 'Invalid input data',
})
@ApiResponse({
  status: 409,
  description: 'Item email already exists',
})
async createItem(@Body() dto: CreateItemRequestDto): Promise<ItemResponseDto> {
  return this.executeCommand(new CreateItemCommand(dto));
}
```

---

## Class-Validator Decorators for Testing

The same decorators used for Swagger documentation enable Jest validation:

```typescript
import { IsString, IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateItemRequestDto {
  @IsString()      // ← Validates type in tests
  @IsNotEmpty()    // ← Validates required in tests
  name: string;

  @IsEmail()       // ← Validates email format in tests
  email: string;

  @IsNumber()
  countryId: number;
}
```

**In Jest tests, you can validate DTOs:**

```typescript
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('CreateItemRequestDto', () => {
  it('should validate correct DTO', async () => {
    const dto = plainToClass(CreateItemRequestDto, {
      name: 'ACME Corp',
      email: 'contact@acme.com',
      countryId: 1,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation for invalid email', async () => {
    const dto = plainToClass(CreateItemRequestDto, {
      name: 'ACME Corp',
      email: 'invalid-email',
      countryId: 1,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
  });
});
```

---

## Common Mistakes

❌ **Using `@ApiProperty` and `@ApiResponse` for request DTOs:**
```typescript
// WRONG - @ApiProperty alone is enough for request DTOs
@Post()
@ApiResponse({
  status: 201,
  type: ItemResponseDto,
})
async create(@Body() dto: CreateItemRequestDto) {
  // DTOs with @ApiProperty are auto-documented
}
```

❌ **Mixing response types with Request DTOs:**
```typescript
// WRONG - Response DTO should be separate
export class CreateItemDto {
  @ApiProperty()
  id: number;  // ← Should NOT be in request DTO
  
  @ApiProperty()
  name: string;
}
```

❌ **Not using `.dto.ts` extension:**
```typescript
// WRONG - File not named with .dto.ts extension
export class CreateItem {
  @ApiProperty()
  name: string;
}
```

❌ **Using query parameters without Query DTO:**
```typescript
// WRONG - No validation or Swagger docs
@Get()
async getItems(@Query('page') page: string) {
  // No type safety, no validation
}

// CORRECT - Use Query DTO
@Get()
async getItems(@Query() query: GetItemsQueryDto) {
  // Type safe, validated, documented
}
```

❌ **Using response DTOs in controller method signature:**
```typescript
// WRONG - Response type annotation doesn't appear in Swagger
@Post()
@Body() dto: CreateItemRequestDto
): ItemResponseDto {  // ← This doesn't auto-document response
  return this.executeCommand(new CreateItemCommand(dto));
}

// CORRECT - Let executeCommand() return type handle documentation
@Post()
@ApiResponse({
  status: 201,
  type: ItemResponseDto,
})
@Body() dto: CreateItemRequestDto
) {
  return this.executeCommand(new CreateItemCommand(dto));
}
```

---

## Implementation Checklist

When creating a new controller:

- [ ] Controller file named `{resource}.controller.ts` in `controllers/` folder
- [ ] Controller extends `CqrsController`
- [ ] Constructor injects `CommandBus`, `QueryBus` (in that order)
- [ ] `@ApiTags('ResourceName')` decorates class
- [ ] Request DTOs use `.dto.ts` extension
- [ ] Response DTOs use `.response.dto.ts` extension
- [ ] `@ApiProperty` only on enums, examples, nullable or union types (plugin covers the rest)
- [ ] DTOs have class-validator decorators (`@IsString()`, `@IsEmail()`, etc.)
- [ ] POST/PATCH/DELETE methods use `executeCommand()`
- [ ] GET methods use `executeQuery()`
- [ ] Paginated GET methods have `@ApplySwaggerPaginationResponse(DtoClass)`
- [ ] Simple GET methods do NOT have pagination decorator
- [ ] All methods have proper `@UseGuards()` annotations
- [ ] Guard logic is in Guards, not in controller methods

---

## Related Skills

- **[nestjs-cqrs](../nestjs-cqrs/SKILL.md)** - CQRS commands, queries, handlers, transactions
- **[typescript](../typescript/SKILL.md)** - DTO types, interfaces, class definitions
- **[docs](../docs/SKILL.md)** - API documentation standards
- **[testing](../testing/SKILL.md)** - Controller and DTO testing with Jest

---

## Resources

- [NestJS Controllers Documentation](https://docs.nestjs.com/controllers)
- [NestJS Swagger/OpenAPI Integration](https://docs.nestjs.com/openapi/introduction)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [class-transformer Documentation](https://github.com/typestack/class-transformer)
