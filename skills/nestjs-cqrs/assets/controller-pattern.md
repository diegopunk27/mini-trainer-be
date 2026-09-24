# Controller Pattern with CQRS

**Pattern Template** - Controllers extend CqrsController and route to commands/queries

## Basic Controller Pattern

```typescript
import { Controller, Post, Get, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CqrsController } from '@cqrs/cqrs.controller';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { GetResourcesQueryDto } from '../dto/get-resources-query.dto';
import { CreateResourceCommand } from '../commands/create-resource/create-resource.command.dto';
import { UpdateResourceCommand } from '../commands/update-resource/update-resource.command.dto';
import { GetAllResourcesQuery } from '../queries/get-resources/get-resources.query.dto';
import { GetResourceByIdQuery } from '../queries/get-resource-by-id/get-resource-by-id.query.dto';
import { DeleteResourceCommand } from '../commands/delete-resource/delete-resource.command.dto';
import { ResourceResponseDto } from '../responses/resource.response.dto';
import { ListResponseDto } from '@persistence';

@ApiTags('Resources')
@Controller('resources')
export class ResourceController extends CqrsController {

  /**
   * CREATE operation
   *
   * CRITICAL: @Body() MUST use .dto.ts file (CreateResourceDto)
   * The Swagger plugin documents DTO fields. @ApiProperty only for enums, examples, nullable/union
   */
  @Post()
  async create(@Body() dto: CreateResourceDto): Promise<ResourceResponseDto> {
    // Controller is THIN - just route to command
    return this.executeCommand(new CreateResourceCommand(dto));
  }

  /**
   * LIST operation with pagination
   */
  @Get()
  async findAll(@Query() query: GetResourcesQueryDto): Promise<ListResponseDto<ResourceResponseDto>> {
    return this.executeQuery(new GetAllResourcesQuery(query));
  }

  /**
   * GET by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ResourceResponseDto> {
    return this.executeQuery(new GetResourceByIdQuery(id));
  }

  /**
   * PATCH for partial updates
   */
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateResourceDto
  ): Promise<ResourceResponseDto> {
    return this.executeCommand(new UpdateResourceCommand({ id, ...dto }));
  }

  /**
   * DELETE operation
   */
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.executeCommand(new DeleteResourceCommand(id));
  }
}
```

## Key Points

### 1. Controllers are THIN
- No business logic
- No direct repository access
- Just routing to commands/queries

### 2. Swagger Integration (Automatic)
- Use `.dto.ts` files in `@Body()`
- DTOs decorated with `@ApiProperty` from `class-validator`
- Swagger automatically generates documentation from DTOs
- Shows all fields, types, examples, and requirements
- **No need for `@ApiOperation` or `@ApiResponse`** - they're optional for extra descriptions only

### 3. Command/Query Pattern
- **POST, PATCH, DELETE** → `executeCommand(new Command(dto))`
- **GET** → `executeQuery(new Query(dto))`
- Always use `new Command(dto)` or `new Query(dto)`

### 4. Type Safety
- Return explicit types (`ResourceResponseDto`, `ListResponseDto<T>`)
- No `any` types
- Use `@Param` and `@Query` with proper types

## DTO Example (Swagger Auto-Documentation)

```typescript
// dto/create-resource.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({
    description: 'Resource name',
    example: 'My Resource',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  categoryId: number;
}
```

**Result**: Swagger automatically shows all fields with descriptions and examples in the API docs.

## Anti-Pattern

❌ **DON'T put business logic in controllers**:
```typescript
// WRONG
@Post()
async create(@Body() dto: CreateResourceDto) {
  const existing = await this.repository.findBy({ name: dto.name });
  if (existing) throw new ConflictException('Exists');
  return await this.repository.save(dto);  // Logic belongs in handler!
}
```

✅ **DO route to commands**:
```typescript
// CORRECT
@Post()
async create(@Body() dto: CreateResourceDto) {
  return this.executeCommand(new CreateResourceCommand(dto));
}
```
