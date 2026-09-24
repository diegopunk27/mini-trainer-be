# Naming Conventions - NestJS CQRS Base

---
name: naming
description: >
  File and folder naming conventions enforced by naming-checker.mjs pre-commit hook. Use when: Creating files, folders, modules, commands, queries, or renaming existing code.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Creating new files"
    - "Creating new folders"
    - "Creating services"
    - "Renaming files or folders"
    - "Refactoring file structure"
    - "Creating commands or queries"
    - "Creating new modules"
---

## Critical Warning

**THESE RULES ARE ENFORCED BY `naming-checker.mjs` IN PRE-COMMIT HOOKS.**

Violating these rules will **fail your commit**. Follow them exactly.

El checker exige kebab-case en **todas** las carpetas y archivos bajo `src/`
(excepto `.gitkeep`). Un archivo puede tener sufijos extra (`create-item.command.ts`).

---

## Quick Reference

| Type            | Rule                    | Example                         |
| --------------- | ----------------------- | ------------------------------- |
| **Folder**      | kebab-case              | `items/`, `create-item/`        |
| **File**        | kebab-case              | `item.controller.ts`            |
| **Command**     | kebab-case + `.command` | `create-item.command.ts`        |
| **Handler**     | kebab-case + `.handler` | `create-item.handler.ts`        |
| **Query**       | kebab-case + `.query`   | `get-items.query.ts`            |
| **Entity**      | kebab-case + `.entity`  | `item.entity.ts`                |
| **Repository**  | kebab-case + `.repository` | `item.repository.ts`         |
| **DTO**         | kebab-case + `.dto`     | `create-item.dto.ts`            |
| **Module**      | kebab-case + `.module`  | `items.module.ts`               |
| **Class**       | PascalCase              | `CreateItemCommand`             |
| **Function**    | camelCase               | `getItemById`                   |
| **Constant**    | UPPER_SNAKE_CASE        | `MAX_RETRIES`                   |

---

## Decision Tree

```
Creating a file under src/?
│
├─ Folder → kebab-case
├─ Command / Query / Handler → kebab-case + suffix
├─ Entity / Repository / DTO / Module → kebab-case + suffix
└─ Other .ts → kebab-case.ts
```

---

## Core Rules

### Folders

```
✅ items/
✅ create-item/
❌ Items/
❌ createItem/
```

### Files

```
✅ item.controller.ts
✅ create-item.command.ts
❌ ItemController.ts
❌ createItem.command.ts
```

### Entities

No barrel `index.ts` que reexporte entidades: TypeORM 1 carga por glob y los barrels rompen el metadata.

Ver tambien `naming-policies.md` en la raiz del repo.
