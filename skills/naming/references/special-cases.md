# Special Cases & Edge Cases

Handling exceptions and edge cases in naming conventions.

---

## Entry Points

**Exception:** Root-level entry points can be lowercase.

```bash
# ✅ Allowed entry points
app.tsx
main.tsx
index.tsx
vite-env.d.ts

# These don't need PascalCase because they're not standard components
```

---

## Test Directories

**In `/tests/` directories, `.test` suffix is REQUIRED**

```bash
# ✅ Correct
hooks/tests/useFetch.test.ts
components/tests/GenericTable.test.tsx
services/tests/item.service.test.ts

# ❌ Incorrect
hooks/tests/useFetch.ts          # Missing .test
hooks/tests/useFetch.spec.ts     # .spec not allowed
```

---

## SCSS Modules

**Pattern:** Match component name + `.module.scss`

```bash
# ✅ Correct
GenericTable.module.scss    # Matches GenericTable.tsx
ItemForm.module.scss    # Matches ItemForm.tsx
NavBar.module.scss          # Matches NavBar.tsx

# ❌ Incorrect
generic-table.module.scss   # kebab-case (should be PascalCase)
genericTable.module.scss    # camelCase (should be PascalCase)
```

---

## Constants in Files

**Constants inside files MUST use UPPER_CASE (ESLint enforced)**

```typescript
// ✅ Correct
export const MAX_ITEMS = 100
export const API_BASE_URL = '/api/v1'
export const DEFAULT_PAGE_SIZE = 10

// ❌ Incorrect
export const maxItems = 100        # camelCase
export const api_base_url = '/api' # snake_case
```

---

## Type/Interface Naming

**Inside files, use PascalCase for types (not enforced by naming-checker but convention)**

```typescript
// ✅ Correct
interface ItemFormData { ... }
type PaymentMethod = 'card' | 'cash'
enum UserRole { ADMIN, USER }

// ❌ Incorrect
interface itemFormData { ... }  # camelCase
type payment_method = ...           # snake_case
```

---

## Acronyms

**Treat acronyms as words in names**

```bash
# ✅ Correct
api-config/           # folder
useHttpClient.ts      # hook (HTTP → Http)
ApiResponse.tsx       # component (API → Api)

# ❌ Incorrect
API-config/           # folder - uppercase
useHTTPClient.ts      # hook - all caps
APIResponse.tsx       # component - all caps
```

---

## Numbers in Names

**Numbers are allowed but use with caution**

```bash
# ✅ Acceptable
auth2.service.ts      # Version indicator
step1-form/           # Sequential indicator

# ⚠️ Avoid if possible
user123.interface.ts  # Arbitrary numbers
```

---

## Context Folder Structure

**Contexts have special structure: kebab-case folder, PascalCase files**

```
contexts/
├── item-form/              # kebab-case folder
│   ├── ItemFormContext.tsx # PascalCase file
│   └── ItemFormProvider.tsx # PascalCase file
└── user-state/                 # kebab-case folder
    ├── UserStateContext.tsx    # PascalCase file
    └── UserStateProvider.tsx   # PascalCase file
```

---

## When naming-checker Runs

The hook runs on `git commit` via:

```bash
npm run check-naming-convention
```

**If violations found:**

```
Se encontraron problemas de convención de nombres:
Archivo .tsx no sigue convención PascalCase: genericTable.tsx
```

**To fix:**

1. Rename files according to rules
2. Stage renamed files: `git add .`
3. Commit again
