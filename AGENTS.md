# Mini-Trainer API - Development Guidelines

## How to Use This Guide

- Start here for project-wide development guidelines and architectural patterns
- Mini-Trainer API is a NestJS/TypeScript API using CQRS pattern
- Each skill provides detailed patterns for specific development tasks
- Skills are auto-invoked based on the task you're performing

## Available Skills

Use these skills for detailed patterns on-demand:

### Core Development Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `code-review` | Architectural patterns, CQRS, modules, testing | [SKILL.md](skills/code-review/SKILL.md) |
| `controllers` | Controller creation, DTOs, Swagger documentation | [SKILL.md](skills/controllers/SKILL.md) |
| `typescript` | Strict TypeScript patterns, types, interfaces | [SKILL.md](skills/typescript/SKILL.md) |
| `nestjs-cqrs` | NestJS CQRS implementation patterns | [SKILL.md](skills/nestjs-cqrs/SKILL.md) |
| `testing` | Unit, integration, and E2E testing patterns | [SKILL.md](skills/testing/SKILL.md) |

### Workflow Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `commit` | Git commit conventions and format | [SKILL.md](skills/commit/SKILL.md) |
| `pr` | Pull request creation and conventions | [SKILL.md](skills/pr/SKILL.md) |
| `teaching` | Teaching mode - explains decisions | [SKILL.md](skills/teaching/SKILL.md) |
| `naming` | kebab-case conventions (pre-commit) | [SKILL.md](skills/naming/SKILL.md) |

### Tracker / Development Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `dev-common` | Config tracker, MCP contracts | [SKILL.md](skills/dev-common/SKILL.md) |
| `dev-tasks` | Descomponer US en Tasks | [SKILL.md](skills/dev-tasks/SKILL.md) |
| `dev-plan-execution` | Ejecutar plan de una Task | [SKILL.md](skills/dev-plan-execution/SKILL.md) |
| `dev-estimation` | Estimacion por arquetipos | [SKILL.md](skills/dev-estimation/SKILL.md) |
| `dev-code-review` | Code review Task / Diff | [SKILL.md](skills/dev-code-review/SKILL.md) |
| `dev-bug-fix-tasks` | Diagnosticar Bug y crear Task | [SKILL.md](skills/dev-bug-fix-tasks/SKILL.md) |
| `dev-testing-strategy` | Diseno de tests | [SKILL.md](skills/dev-testing-strategy/SKILL.md) |
| `dev-sprint-review` | Metricas de sprint | [SKILL.md](skills/dev-sprint-review/SKILL.md) |

### Documentation & Meta Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `docs` | Documentation standards and practices | [SKILL.md](skills/docs/SKILL.md) |
| `skill-creator` | Create new AI agent skills | [SKILL.md](skills/skill-creator/SKILL.md) |
| `skill-sync` | Sync skill metadata to AGENTS.md | [SKILL.md](skills/skill-sync/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Adding environment variables | `code-review` |
| After creating/modifying a skill | `skill-sync` |
| Aligning test coverage with a Task development plan | `dev-testing-strategy` |
| Analyzing sprint metrics from a tracker CSV export | `dev-sprint-review` |
| Breaking down a user story into tracker tasks | `dev-tasks` |
| Building an executable development plan per task | `dev-tasks` |
| Calibrating estimation archetypes from sprint data | `dev-sprint-review` |
| Committing changes | `commit` |
| Create a PR with gh pr create | `pr` |
| Creating API documentation | `docs` |
| Creating API endpoints | `controllers` |
| Creating DTOs or entities | `typescript` |
| Creating a fix Task linked to a Bug and its parent US | `dev-bug-fix-tasks` |
| Creating a git commit | `commit` |
| Creating a pull request | `pr` |
| Creating and linking tracker tasks to a user story | `dev-tasks` |
| Creating commands or queries | `naming` |
| Creating commands or queries | `nestjs-cqrs` |
| Creating controllers | `controllers` |
| Creating database migrations | `code-review` |
| Creating entities with TypeORM | `nestjs-cqrs` |
| Creating many-to-many relationships | `nestjs-cqrs` |
| Creating new files | `naming` |
| Creating new folders | `naming` |
| Creating new modules | `naming` |
| Creating new modules | `nestjs-cqrs` |
| Creating new skills | `skill-creator` |
| Creating services | `naming` |
| Creating test files | `testing` |
| Deciding test layer and omit-list before implementing | `dev-testing-strategy` |
| Designing a test strategy from acceptance criteria | `dev-testing-strategy` |
| Diagnosing the root cause of a Bug before fixing it | `dev-bug-fix-tasks` |
| Documenting API endpoints | `controllers` |
| Estimating a tracker task | `dev-estimation` |
| Estimating agentic development work in hours | `dev-estimation` |
| Evaluating a diff against architecture rules and stack decisions | `dev-code-review` |
| Executing a tracker task development plan | `dev-plan-execution` |
| Explaining code patterns | `teaching` |
| Filling pull request template | `pr` |
| Generating PR description | `pr` |
| Generating tasks with development plans from a US | `dev-tasks` |
| Implementing CQRS handlers | `nestjs-cqrs` |
| Implementing HTTP routes | `controllers` |
| Implementing a task from its tracker plan | `dev-plan-execution` |
| Implementing new features | `code-review` |
| Implementing new features | `teaching` |
| Loading RemainingWork estimate for a task | `dev-estimation` |
| Loading project config for tracker flows | `dev-common` |
| Making technical decisions | `teaching` |
| Matching a task to an archetype for estimation | `dev-estimation` |
| Planning a bug fix Task from a tracker Bug | `dev-bug-fix-tasks` |
| Reading tracker work items | `dev-common` |
| Refactoring TypeScript code | `typescript` |
| Refactoring code | `code-review` |
| Refactoring code | `teaching` |
| Refactoring file structure | `naming` |
| Regenerate AGENTS.md Auto-invoke tables | `skill-sync` |
| Renaming files or folders | `naming` |
| Resolving tracker project or repository IDs | `dev-common` |
| Reviewing a tracker Task before closing it | `dev-code-review` |
| Reviewing code | `teaching` |
| Reviewing estimation accuracy at sprint close | `dev-sprint-review` |
| Reviewing pull requests | `code-review` |
| Running a Task mode or Diff mode code review | `dev-code-review` |
| Running a sprint retrospective report | `dev-sprint-review` |
| Running step-by-step development of a planned task | `dev-plan-execution` |
| Setting up transactional operations | `nestjs-cqrs` |
| Suggesting architectural changes | `teaching` |
| Testing CQRS handlers | `testing` |
| Testing controllers | `testing` |
| Troubleshoot why a skill is missing from AGENTS.md | `skill-sync` |
| Updating README files | `docs` |
| Working with CommandBus or QueryBus | `nestjs-cqrs` |
| Writing E2E tests | `testing` |
| Writing TypeScript types/interfaces | `typescript` |
| Writing documentation | `docs` |
| Writing integration tests | `testing` |
| Writing technical guides | `docs` |
| Writing to the tracker via MCP | `dev-common` |
| Writing unit tests | `testing` |

---

## Project Overview

A NestJS-based REST API template using CQRS pattern. Provides a generic base for building APIs with authentication, database integration, and clean architecture.

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | NestJS 11 + TypeScript 6 | REST API framework |
| Architecture | CQRS Pattern | Command Query Responsibility Segregation |
| Database | Postgres + TypeORM 1.1 | Motor único Postgres |
| Persistence | `@persistence` | BaseRepository, TransactionalHandler, UoW |
| Testing | Jest 30 | Unit and E2E testing |
| Authentication | JWT | Token-based authentication and authorization |

---

## Architecture Principles

### CQRS Pattern (Mandatory)

- All controllers extend `CqrsController`
- Write operations use `executeCommand()` with Command classes
- Read operations use `executeQuery()` with Query classes
- Handlers are registered with `@CommandHandler()` or `@QueryHandler()`

### Module Structure

```
modules/
└── {module-name}/
    ├── commands/          # Write operations
    ├── queries/           # Read operations
    ├── controllers/       # Route handlers
    ├── repositories/      # Database access
    ├── entities/          # TypeORM entities
    ├── dto/              # Request DTOs
    ├── responses/        # Response DTOs
    ├── validators/       # Business logic validation
    ├── mappers/          # Entity-DTO transformation
    ├── constants/        # Module constants
    └── {module-name}.module.ts
```

### Key Libraries

- **@persistence**: Base repository, UnitOfWorkService, TransactionalHandler
- **class-validator**: DTO validation decorators
- **@nestjs/cqrs**: Command/Query bus implementation

---

## Development Workflow

### Setup Local Environment

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your local configuration

# Run migrations
npm run typeorm:run-migrations

# Start development server
npm run start:dev

# Or use VS Code debugger for breakpoints
# Use "Debug NestJS Framework" configuration
```

### Running Tests

```bash
# Unit tests
npm run test:unit

# E2E tests
npm run test:e2e

# Debug specific test (use VS Code)
# Select "Debug Jest unit test" or "Debug Jest e2e"
```

### Code Quality

```bash
# Linting (runs on pre-commit)
npm run lint

# Format code
npm run format

# Pre-commit hooks
# Automatically run on git commit via Husky
```

---

## Commit & Pull Request Guidelines

### Commit Format (Mandatory)

```
#MT-123 : TÍTULO DESCRIPTIVO EN MAYÚSCULAS

Descripción detallada de los cambios globales realizados.
```

- Task ID from the branch with `^(feature|bugfix)/([A-Z]+-\d+)-` (prefix in `skills/dev-common/config/dev-project-config.md`). Numeric ADO ids still work (`feature/1234-descripcion`)
- Title in UPPERCASE explaining the feature/fix
- Detailed description of main changes

### Pull Request Process

1. Extract task number from branch
2. Run `git diff development` (or target branch)
3. Generate PR description with:
   - **Motivo de cambio**: Why these changes are needed
   - **Cambios realizados**: Main changes (max 5 points)
   - **Impacto**: Impact on end user
   - **Archivos clave**: Key files modified (max 5)
   - **Tareas relacionadas**: Related task IDs (`#MT-123` or `#123`) and, if Tracker = notion, the Notion page link

4. Create PR:
```bash
gh pr create --title "#123 Título descriptivo" --body "$(cat <<'EOF'
# #123 Título Descriptivo

## Motivo de cambio
...

## Cambios realizados
- ...

## Impacto
- ...

## Archivos clave
- ...

## Tareas relacionadas
#123
EOF
)"
```

---

## Environment Variables

**CRITICAL**: When adding environment variables:

1. Add to `.env.example` with descriptive comment
2. Access via `ConfigService`, never `process.env` directly

---

## Database Migrations

**CRITICAL**: When creating migrations:

1. Create migration: `npm run typeorm:create-migration -- migrations/MigrationName`
2. Run migrations: `npm run typeorm:run-migrations`
3. Test locally before committing

---

## Common Commands

```bash
# Development
npm run start:dev              # Start dev server
npm run start:debug            # Start with debug mode

# Database
npm run typeorm:run-migrations     # Run migrations
npm run typeorm:revert-migration   # Revert last migration
npm run typeorm:create-migration   # Create new migration

# Testing
npm run test:unit              # Run unit tests
npm run test:e2e               # Run E2E tests
npm run test:cov               # Run with coverage

# Code Quality
npm run lint                   # Run ESLint
npm run format                 # Format with Prettier

# Build
npm run build                  # Build for production

# Docker
docker compose -f docker-compose.dev.yml --profile postgres up
```

---

## Project Standards

### Naming Conventions

- **Files/Folders**: kebab-case (`user-service.ts`, `create-user.command.ts`)
- **Classes**: PascalCase (`UserService`, `CreateUserCommand`)
- **Functions/Variables**: camelCase (`getUserById`, `userName`)
- **Constants**: UPPERCASE (`MAX_RETRIES`, `API_BASE_URL`)
- **Environment Variables**: UPPERCASE_WITH_UNDERSCORES

### TypeScript

- Always declare types explicitly
- Never use `any` (use `unknown` with type guards)
- Use `readonly` for immutable data
- Prefer `interface` for object shapes
- Use utility types (`Pick`, `Omit`, `Partial`, etc.)

### Testing

- E2E tests for all new endpoints
- Use AAA pattern (Arrange, Act, Assert)
- Clean up test data in `afterAll`
- Mock external services (S3, Lambda)
- Validate response structure with `validateAndTransformResponse`

---

## Git Workflow

```
main (production)
  └── certification (staging)
      └── development (integration)
          └── feature/MT-123-descripcion (feature branches)
```

- **Feature branches**: From `development`, named `feature/PREFIX-123-descripcion` or `bugfix/PREFIX-123-descripcion` (numeric ADO ids still valid)
- **Integration**: PR to `development` with squash commit
- **Staging**: PR from `development` to `certification` with merge commit
- **Production**: PR from `certification` to `main` with merge commit

---

## Support & Resources

- **Internal Documentation**: See `docs/` folder
- **Issue Tracking**: Tracker configured in `skills/dev-common/config/dev-project-config.md` (`ado` or `notion`)
- **Team Communication**: Slack channel

---

**For detailed patterns and guidelines, always consult the specific skill documentation linked above.**
