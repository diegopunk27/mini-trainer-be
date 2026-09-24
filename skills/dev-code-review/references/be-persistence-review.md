# BE Persistence Review

Checklist de review para codigo de persistencia en tareas `Dev BE`. Cargar solo si Activity es `Dev BE` o el diff toca entities, migraciones o repositorios.

No aplica a FE puro ni a cambios sin codigo de persistencia.

---

## Cuando aplica

- El diff incluye archivos de entity / modelo ORM.
- El diff incluye migraciones (SQL, TypeORM, EF Core, Flyway, etc.).
- El diff incluye repositorios o queries directas a DB.

Si ninguna de las tres condiciones aplica, omitir este checklist.

---

## Checklist de review

### Entity / modelo ORM

- **Drift entity↔migracion**: la entity refleja la migracion (o viceversa). Columnas, tipos, nullability y nombres alineados entre ambos artefactos.
- **Naming**: nombres de columnas y tablas coherentes con las convenciones del stack (rol / manifiestos).
- **Nullability**: campos obligatorios marcados como `NOT NULL`; campos opcionales con default o nullable explicito. No dejar nullability ambigua.
- **Relaciones**: FK, cascades y owning side definidos correctamente segun el ORM del stack.
- **Decorators / anotaciones**: completos y correctos segun el ORM (no omitir `@Column`, `@JoinColumn`, `@ManyToOne`, etc. cuando el ORM los requiere).

### Migracion

- **Reversible**: la migracion tiene `down` funcional (o el equipo acepta migraciones irreversibles documentadas).
- **Destructiva con cuidado**: `DROP COLUMN`, `DROP TABLE`, cambios de tipo incompatibles — revisarlos explicitamente. Marcar como `[Bloqueante]` si pueden causar perdida de datos en produccion sin ventana de deprecacion.
- **Sin logica de negocio**: las migraciones mueven esquema, no corren transformaciones de datos complejas sin respaldo.
- **Nombre descriptivo**: el nombre del archivo/clase de migracion describe el cambio (no `Migration1234` ni timestamp solo).

### Repositorio / queries

- **N+1**: queries dentro de loops sin carga eager o batch load cuando el volumen lo justifica.
- **Indice faltante**: queries sobre columnas sin indice en tablas con volumen esperado alto (si el rol o el CA lo sugiere).
- **Transacciones**: operaciones que modifican multiples entidades en una sola unidad de negocio estan bajo transaccion.

---

## Severidad sugerida

| Hallazgo | Severidad default |
|---|---|
| Drift entity↔migracion (columna faltante o tipo distinto) | `[Bloqueante]` |
| Campo nullable ambiguo en entity nueva | `[Mayor]` |
| Migracion destructiva sin ventana / sin `down` | `[Bloqueante]` |
| N+1 en path caliente | `[Mayor]` |
| Naming inconsistente | `[Menor]` |
| Indice sugerido (volumen incierto) | `[Nit]` |

Ajustar segun contexto del proyecto; estas son guias, no reglas fijas.
