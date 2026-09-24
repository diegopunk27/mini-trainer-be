# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**IMPORTANT**: This is a supplementary guide. The authoritative development guidelines are in:

- **AGENTS.md** — Architecture, CQRS patterns, commit/PR conventions
- **skills/** — Detailed patterns (nestjs-cqrs, controllers, testing, tracker flows, etc.)

When performing tasks, check AGENTS.md first to auto-invoke relevant skills.

## Quick Commands

```bash
yarn start:dev                   # Nest watch
yarn start:debug                 # Debug watch
yarn test:unit                   # Jest unit
yarn test:e2e                    # Jest e2e (DB real)
yarn typeorm:run-migrations
yarn lint-check                  # naming + eslint
yarn build                       # nest build
```

## Available Skills

Always check **AGENTS.md** for auto-invoke guidance. Key skills:

| Skill | Use For |
|-------|---------|
| **nestjs-cqrs** | Commands, Queries, entities, modules |
| **controllers** | HTTP, DTOs, Swagger |
| **testing** | Unit + e2e |
| **code-review** | Arquitectura, migraciones, env vars |
| **teaching** | Explicar decisiones |
| **naming** | kebab-case bajo `src/` |
| **commit** / **pr** | Git conventions |
| **dev-*** | Flujos de tracker (ADO o Notion) |

## Architecture Overview

- NestJS 11 + TypeScript 6 + CQRS obligatorio
- TypeORM 1.1, motor único Postgres
- Persistencia vendored en `@persistence` (`BaseRepository`, `TransactionalHandler`, `UnitOfWorkService`)
- Auth: JWT / Passport
- Modulo de ejemplo: `src/modules/items/`

## Code Conventions

- Files/folders kebab-case. No barrel `index.ts` para entidades.
- Env vars via `ConfigService`. Agregar a `.env.example`.
- Express 5: wildcards `*splat`; `query parser` = `extended`.

## Git

```
#MT-123 : TÍTULO DESCRIPTIVO EN MAYÚSCULAS
```

ID from `^(feature|bugfix)/([A-Z]+-\d+)-`. Numeric ADO ids still work.

PRs against `development` with the Spanish template in skill `pr`.
