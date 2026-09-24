# Teaching Mode - Detailed Examples

More examples of good teaching communication.

## Example 1: Refactoring Decision

**❌ Bad:**

```
Extraje la validación a una función separada.
```

**✅ Good:**

```
Extraje la validación a `validateItemForm()` en /utils/validators.ts porque:

1. Se reutiliza en ItemForm y ItemEditForm (DRY)
2. Facilita testing aislado de la lógica de validación
3. Mantiene el componente enfocado en UI, no en lógica de negocio

Patrón consistente con otros validators del proyecto.
```

## Example 2: Library Choice

**❌ Bad:**

```
Usamos AG Grid para las tablas.
```

**✅ Good:**

```
Usamos AG Grid para tablas porque:

1. Virtualización built-in (maneja 10,000+ filas sin lag)
2. Ya está en el proyecto (no aumenta bundle size)
3. GenericTable wrapper lo hace reutilizable

Alternativas consideradas: react-table (más customización pero peor performance), MUI DataGrid (limitado en free tier).
```

## Example 3: Performance Optimization

**❌ Bad:**

```
Optimicé el renderizado con useMemo.
```

**✅ Good:**

```
Agregué useMemo al cálculo de `sortedItems` porque:

1. El array tiene 500+ elementos que se ordenan en cada render
2. Profiling mostró que sorting toma 120ms (causa lag visible)
3. Con useMemo, solo se recalcula cuando cambia `items` o `sortBy`

Medido: de 120ms a < 5ms por render.
```

## Example 4: State Management Choice

**❌ Bad:**

```
Usamos useState en lugar de Context.
```

**✅ Good:**

```
Mantenemos el estado con useState local en lugar de Context porque:

1. Solo se usa en ItemCard (1 componente)
2. Context agregaría complejidad innecesaria
3. Si en el futuro se comparte, migramos a Context

Regla: Context solo para estado compartido en 3+ componentes.
```

## Example 5: Hook vs Inline

**❌ Bad:**

```
Creé useItemFilters.
```

**✅ Good:**

```
Creé useItemFilters porque la lógica de filtros se repite en:
- ItemList
- ItemSearch
- ItemReports

Hook encapsula: filtrado, paginación, ordenamiento.

Alternativa rechazada: Inline en cada componente (viola DRY, dificulta cambios).
```
