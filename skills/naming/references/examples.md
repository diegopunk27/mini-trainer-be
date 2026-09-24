# Naming Examples

Detailed examples for each naming convention.

---

## Folder Examples

**Pattern:** `/^[a-z0-9]+(-[a-z0-9]+)*$/` (lowercase or kebab-case)

```bash
# ✅ Correct
items/
exchange-rate/
credit-customer/
user-management/
api-config/

# ❌ Incorrect
itemData/      # camelCase
Items/         # PascalCase
item_data/     # snake_case
UserManagement/    # PascalCase
API-Config/        # Uppercase letters
```

---

## Hook File Examples

**Pattern:** `/^[a-z][a-zA-Z0-9]*$/` (camelCase)

```bash
# ✅ Correct
useFetch.ts
usePagination.ts
useFormValidation.ts
useLocalStorage.ts
useItemForm.ts

# ❌ Incorrect
UseFetch.ts        # PascalCase
use-fetch.ts       # kebab-case
use_fetch.ts       # snake_case
Usefetch.ts        # Wrong casing
```

---

## Component File Examples

**Pattern:** `/^[A-Z][a-zA-Z0-9]*$/` (PascalCase)

```bash
# ✅ Correct
GenericTable.tsx
NavBar.tsx
ItemForm.tsx
ConfirmDialog.tsx
LoadingErrorDisplay.tsx

# ❌ Incorrect
genericTable.tsx   # camelCase
generic-table.tsx  # kebab-case
GENERIC_TABLE.tsx  # UPPER_SNAKE
item_form.tsx  # snake_case
```

**Exception:** Entry points can be lowercase (`app.tsx`, `main.tsx`)

---

## Service File Examples

**Pattern:** `/^[a-z0-9]+(-[a-z0-9]+)*.service.ts$/` (kebab-case + .service.ts)

```bash
# ✅ Correct
private-http.service.ts
item.service.ts
file-upload.service.ts
auth.service.ts
payment-gateway.service.ts

# ❌ Incorrect
privateHttp.service.ts    # camelCase
PrivateHttp.service.ts    # PascalCase
private_http.service.ts   # snake_case
privatehttp.service.ts    # No separator
```

---

## Interface File Examples

**Pattern:** kebab-case + `.interface.ts`

```bash
# ✅ Correct
item.interface.ts
item-form.interface.ts
api-response.interface.ts
user-profile.interface.ts

# ❌ Incorrect
Item.interface.ts     # PascalCase
item.ts               # Missing .interface suffix
ItemForm.interface.ts # PascalCase
```

---

## Enum File Examples

**Pattern:** kebab-case + `.enum.ts`

```bash
# ✅ Correct
item-status.enum.ts
report-type.enum.ts
user-role.enum.ts
payment-method.enum.ts

# ❌ Incorrect
ItemStatus.enum.ts    # PascalCase
itemStatus.enum.ts    # camelCase
item_status.enum.ts   # snake_case
```

---

## Test File Examples

**Pattern:** original name + `.test.ts`

```bash
# ✅ Correct (in /tests/ directories)
useFetch.test.ts
validators.test.ts
GenericTable.test.tsx
item.service.test.ts

# ❌ Incorrect
useFetch.ts              # Missing .test
useFetch.spec.ts         # .spec not allowed
UseFetch.test.ts         # Wrong base name casing
```

---

## Complete Module Example

```
modules/exchange-rate/           # kebab-case folder
├── pages/
│   └── ExchangeRateList.tsx    # PascalCase component
├── components/
│   ├── RateCard.tsx            # PascalCase component
│   └── RateFilter.tsx          # PascalCase component
├── hooks/
│   ├── useExchangeRate.ts      # camelCase hook
│   └── tests/
│       └── useExchangeRate.test.ts  # camelCase + .test
├── services/
│   └── exchange-rate.service.ts     # kebab-case + .service
├── interfaces/
│   ├── exchange-rate.interface.ts   # kebab-case + .interface
│   └── rate-filter.interface.ts     # kebab-case + .interface
├── enums/
│   └── currency-type.enum.ts        # kebab-case + .enum
└── constants/
    └── rate-constants.ts            # kebab-case
```
