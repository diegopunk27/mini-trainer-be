# Documentation Standards - NestJS CQRS Base Template

---
name: docs
description: >
  Documentation style guide and writing standards for NestJS CQRS Base Template. For controller creation and API endpoint documentation, see controllers skill. Trigger: When writing documentation, README files, API documentation, or technical guides.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Writing documentation"
    - "Updating README files"
    - "Creating API documentation"
    - "Writing technical guides"
---

## When to Use

Use this skill when writing documentation for:
- Feature documentation
- API/SDK references
- Setup and installation guides
- Architectural decisions
- Development guidelines
- Troubleshooting guides

---

## Documentation Principles

### Clarity and Conciseness

- Write in clear, accessible language
- Minimize jargon - define technical terms on first use
- Use active voice: "Run the command" not "The command should be run"
- Keep sentences short and focused
- Use bullet points for lists of items

### Technical Accuracy

- Verify all commands and code examples work
- Include version numbers when relevant
- Document prerequisites and dependencies
- Show expected output when helpful
- Note platform-specific behavior (Linux, macOS, Windows)

### Maintainability

- Keep documentation close to code when possible
- Update docs when code changes
- Remove outdated information promptly
- Use references instead of duplicating content
- Date time-sensitive information

---

## Documentation Structure

### README.md Structure

Every project/module README should contain:

```markdown
# Project/Module Name

Brief description (1-2 sentences)

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Common Commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

Detailed description of what the project does and why it exists.

## Prerequisites

- Node.js >= 18.x
- MySQL >= 8.0
- AWS CLI configured (for S3 operations)

## Installation

\`\`\`bash
npm install
cp .env.example .env
# Edit .env with your configuration
\`\`\`

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |

## Usage

### Running Locally

\`\`\`bash
npm run start:dev
\`\`\`

### Building

\`\`\`bash
npm run build
\`\`\`

## Testing

\`\`\`bash
npm run test:unit    # Unit tests
npm run test:e2e     # E2E tests
\`\`\`

## Deployment

[Deployment instructions specific to project]

## Common Commands

\`\`\`bash
npm run start:dev        # Start development server
npm run test:unit        # Run unit tests
npm run lint             # Run linter
\`\`\`

## Troubleshooting

### Issue: Database connection fails

**Solution**: Check that MySQL is running and credentials in .env are correct.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
```

---

## Code Examples

### Format for Code Blocks

Always specify language for syntax highlighting:

```typescript
// ✅ Correct - with language
// ```typescript
function hello(name: string): string {
  return `Hello, ${name}!`;
}
// ```

// ❌ Incorrect - no language
// ```
function hello(name) {
  return `Hello, ${name}!`;
}
// ```
```

### Complete Examples

Provide complete, runnable examples:

```typescript
// ✅ Good - Complete example
import { Controller, Get } from '@nestjs/common';
import { CqrsController } from '@cqrs/cqrs.controller';
import { GetUsersQuery } from './queries/get-users.query.dto';

@Controller('users')
export class UserController extends CqrsController {
  @Get()
  async getUsers() {
    return this.executeQuery(new GetUsersQuery());
  }
}

// ❌ Bad - Incomplete example
@Controller('users')
export class UserController {
  @Get()
  async getUsers() {
    // ... implementation
  }
}
```

### Command Examples

Show commands with expected output when helpful:

```bash
# ✅ Good - Shows command and output
$ npm run test:unit

> nestjs_cqrs_base@1.0.0 test:unit
> jest --config jest.config.js

PASS  src/modules/user/user.service.spec.ts
  ✓ should create user (45ms)
  ✓ should find user by id (12ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

---

## API Documentation

### Endpoint Documentation with Controllers

For complete patterns on creating API endpoints, controllers, DTOs, and Swagger documentation, see [controllers skill](../controllers/SKILL.md).

The key principle is: **Response DTOs rely on the Swagger plugin. `@ApiProperty` only for enums, examples, and nullable or union types.** See [controllers skill](../controllers/SKILL.md).

### Endpoint Structure

Document all endpoints with:
- HTTP method and path
- Description
- Request parameters/body
- Response format
- Error codes
- Example request/response

**Template:**

```markdown
### POST /api/items

Creates a new item in the system.

**Request Body:**

\`\`\`json
{
  "name": "ACME Corp",
  "email": "contact@acme.com",
  "countryId": 1,
  "categoryId": 2
}
\`\`\`

**Response (201 Created):**

\`\`\`json
{
  "id": 123,
  "name": "ACME Corp",
  "email": "contact@acme.com",
  "countryId": 1,
  "categoryId": 2,
  "status": "pending_approval",
  "createdAt": "2024-01-15T10:30:00Z"
}
\`\`\`

**Error Responses:**

- **400 Bad Request**: Invalid input data
- **409 Conflict**: Item with this email already exists
- **403 Forbidden**: User doesn't have permission

**Example:**

\`\`\`bash
curl -X POST https://api.example.com/api/items \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "name": "ACME Corp",
    "email": "contact@acme.com",
    "countryId": 1,
    "categoryId": 2
  }'
\`\`\`
```

### Swagger/OpenAPI

For detailed controller creation and API endpoint documentation patterns, see [controllers skill](../controllers/SKILL.md).

**Quick reference**: When using `.dto.ts` files with `@ApiProperty()` decorators, NestJS Swagger automatically generates request/response schema documentation. Add additional decorators only for status codes and error responses.

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({
    description: 'Item company name',
    example: 'ACME Corp',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'contact@acme.com',
    required: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@ApiTags('Items')
@Controller('items')
export class ItemController extends CqrsController {
  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({
    status: 201,
    description: 'Item created successfully',
    type: ItemResponseDto
  })
  @ApiResponse({
    status: 409,
    description: 'Item with this email already exists'
  })
  async create(@Body() dto: CreateItemDto) {
    return this.executeCommand(new CreateItemCommand(dto));
  }
}
```

---

## Configuration Documentation

### Environment Variables

Document all environment variables in .env.example with comments:

```bash
# Database Configuration
DB_HOST=localhost          # MySQL host address
DB_PORT=3306               # MySQL port
DB_USERNAME=root           # Database username
DB_PASSWORD=secret         # Database password
DB_DATABASE=app_db       # Database name

# AWS Configuration
AWS_ACCESS_KEY_ID=         # AWS access key for S3 operations
AWS_SECRET_ACCESS_KEY=     # AWS secret key
AWS_REGION=us-east-1       # AWS region for services
SMTP_FROM=       # S3 bucket for item documents
```

Create a detailed configuration table in README:

```markdown
### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 4000 | HTTP server port |
| DB_HOST | Yes | - | MySQL host address |
| DB_PORT | Yes | - | MySQL port (usually 3306) |
| DB_USERNAME | Yes | - | Database username |
| DB_PASSWORD | Yes | - | Database password |
| DB_DATABASE | Yes | - | Database name |
| AWS_ACCESS_KEY_ID | Yes | - | AWS access key for S3 |
| SMTP_FROM | Yes | - | S3 bucket for item files |
```

---

## Architecture Documentation

### Module Documentation

Each module should have a README explaining:

```markdown
# Item Module

## Overview

Manages item lifecycle from registration to approval.

## Architecture

\`\`\`
ItemModule
├── controllers/
│   └── item.controller.ts      # HTTP endpoints
├── commands/
│   ├── create-item/            # Create item command
│   └── approve-item/           # Approve item command
├── queries/
│   ├── get-items/              # List items
│   └── get-item-by-id/         # Get single item
├── repositories/
│   └── item.repository.ts      # Database access
├── entities/
│   └── item.entity.ts          # TypeORM entity
├── services/
│   └── item-workflow.service.ts # Workflow orchestration
└── item.module.ts               # Module definition
\`\`\`

## Key Features

- Multi-level approval workflow
- Document management with S3
- Email notifications
- Audit trail for all changes

## Dependencies

- FilesModule: For document handling
- ProcessModule: For workflow state management
- AuthModule: For user authentication
- NotificationModule: For email notifications

## Usage

### Creating a Item

\`\`\`typescript
import { CreateItemCommand } from './commands/create-item.command.dto';

const command = new CreateItemCommand({
  name: 'ACME Corp',
  email: 'contact@acme.com',
  countryId: 1,
  categoryId: 2,
});

await this.commandBus.execute(command);
\`\`\`

### Querying Items

\`\`\`typescript
import { GetItemsQuery } from './queries/get-items.query.dto';

const query = new GetItemsQuery({
  page: 1,
  limit: 10,
  status: ItemStatus.PENDING,
});

const result = await this.queryBus.execute(query);
// Returns: ListResponseDto<Item>
\`\`\`

## Testing

\`\`\`bash
# Run item module tests
npm run test:e2e -- item

# Run specific test file
npm run test:e2e -- create-item.e2e.spec.ts
\`\`\`
```

---

## Decision Records

### Architecture Decision Records (ADR)

For significant architectural decisions, create ADRs:

```markdown
# ADR-001: Use CQRS Pattern for Business Logic

## Status

Accepted

## Context

We need a clear separation between read and write operations to:
- Support complex business workflows
- Enable independent scaling of reads vs writes
- Facilitate testing of business logic
- Maintain transaction boundaries

## Decision

We will use the CQRS (Command Query Responsibility Segregation) pattern for all business logic:
- Commands for write operations (Create, Update, Delete)
- Queries for read operations (List, Get)
- CommandBus and QueryBus for communication
- Handlers for business logic implementation

## Consequences

### Positive
- Clear separation of concerns
- Easier to test handlers in isolation
- Transaction management is explicit
- Business logic is centralized in handlers

### Negative
- More boilerplate code (commands, queries, handlers)
- Learning curve for new developers
- Slightly more complex than direct service calls

## Implementation

All new modules MUST follow CQRS pattern:
- Controllers extend CqrsController
- Commands/Queries in separate folders
- Handlers registered as providers
- No direct repository calls from controllers
```

---

## Troubleshooting Documentation

### Problem-Solution Format

```markdown
## Troubleshooting

### Database Connection Issues

**Problem**: Application fails to start with "Connection refused" error.

**Symptoms**:
\`\`\`
Error: connect ECONNREFUSED 127.0.0.1:3306
\`\`\`

**Causes**:
1. MySQL server is not running
2. Incorrect database credentials in .env
3. Firewall blocking connection

**Solutions**:

1. **Check MySQL is running**:
   \`\`\`bash
   # Linux/macOS
   sudo systemctl status mysql

   # macOS with Homebrew
   brew services list
   \`\`\`

2. **Verify credentials**:
   - Check .env file has correct DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
   - Test connection manually:
   \`\`\`bash
   mysql -h localhost -u root -p -e "SELECT 1"
   \`\`\`

3. **Check firewall rules**:
   \`\`\`bash
   # Linux
   sudo ufw status

   # Allow MySQL port
   sudo ufw allow 3306/tcp
   \`\`\`

### Migration Errors

**Problem**: Migrations fail with "Table already exists" error.

**Symptoms**:
\`\`\`
Error: Table 'items' already exists
\`\`\`

**Solution**:

1. Check migration history:
   \`\`\`bash
   npm run typeorm:show-migrations
   \`\`\`

2. If migration already ran, revert it:
   \`\`\`bash
   npm run typeorm:revert-migration
   \`\`\`

3. Fix migration file and run again:
   \`\`\`bash
   npm run typeorm:run-migrations
   \`\`\`
```

---

## Language and Style

### Spanish vs English

- **Code**: Always in English (classes, variables, functions)
- **Documentation**: Spanish for user-facing docs, English for technical docs
- **Comments**: Spanish for business logic, English for technical details
- **API Documentation**: Spanish for descriptions, English for technical terms
- **Commit Messages**: Spanish (as per project standards)

### Formatting

- Use **bold** for emphasis on important points
- Use `code formatting` for commands, file names, variables
- Use > blockquotes for important notes or warnings
- Use tables for structured information (config, APIs)

**Example:**

```markdown
> **IMPORTANT**: Always backup your database before running migrations in production.

To run migrations:

1. **Verify connection**: Check that `.env` file has correct database credentials
2. **Run migrations**: Execute `npm run typeorm:run-migrations`
3. **Verify success**: Check that all migrations are applied with `npm run typeorm:show-migrations`
```

---

## Documentation Checklist

Before finalizing documentation:

- [ ] All code examples are complete and tested
- [ ] Commands show expected behavior
- [ ] Prerequisites are clearly stated
- [ ] Environment variables are documented
- [ ] API endpoints have request/response examples
- [ ] Error cases are documented
- [ ] Troubleshooting section exists for common issues
- [ ] Links to related documentation are working
- [ ] No outdated information remains
- [ ] Technical terms are defined on first use

---

## Resources

### Internal Documentation

- **Project README**: `/README.md`
- **Module READMEs**: `/src/modules/{module}/README.md`
- **API Documentation**: Available at `/api-docs` when running locally
- **Architecture Decisions**: `/docs/adr/` folder
- **Skills Documentation**: `/skills/` folder

### External Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Swagger/OpenAPI Documentation](https://swagger.io/docs/)
- [Markdown Guide](https://www.markdownguide.org/)

---

**Remember**: Good documentation saves time for everyone. Write documentation you'd want to read if you were new to the project.
