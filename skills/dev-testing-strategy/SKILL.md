# Dev Testing Strategy - NestJS CQRS Base

---
name: dev-testing-strategy
description: >
  Disenar tests automatizados desde los criterios de aceptacion de una User Story. Orquesta capa, casos de uso y omit-list segun el stack del proyecto. Trigger: Cuando dev-plan-execution (Fase 2) necesita un diseno de tests, o cuando dev-tasks, dev-code-review o dev-bug-fix-tasks necesitan alinear cobertura con la estrategia de testing.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Designing a test strategy from acceptance criteria"
    - "Deciding test layer and omit-list before implementing"
    - "Aligning test coverage with a Task development plan"
---

Disenar **que** tests automatizados hacen falta y **en que capa**, antes de escribir codigo de test.

## Separacion de responsabilidades

| Pieza | Rol | Customizar por proyecto |
|-------|-----|-------------------------|
| Este `SKILL.md` | Procedimiento fijo (orden, pausas, output) | **No** |
| `references/` | Criterio y defaults (matrices, BE/FE, regresion) | **Si** |
| Regla de rol / rules de arquitectura | Arnes del stack (hechos, convenciones, comandos de validacion) | Si (otro dominio) |
| Entrypoints (tabla "Auto-invoke Skills" de `AGENTS.md`) | Que skill invocar | Casi no |

Los hechos de stack (tipado, ORM, runner) salen del **rol** y, si hace falta, de manifiestos.
La **politica** de diseno (que omitir, capa por tipo de CA) vive en `references/`.

## Cuando usarla

- Invocada por `../dev-plan-execution` en **Fase 2** (diseno de tests).
- Referenciada por `../dev-tasks`, `../dev-code-review` y `../dev-bug-fix-tasks` cuando necesitan alinear cobertura o regresion con esta estrategia.
- No reemplaza la ejecucion: **no escribe** archivos de test (eso lo hace plan-execution Fase 4).

## Contexto requerido

- `../dev-common/SKILL.md` y `../dev-common/config/dev-project-config.md`
- Regla de rol/stack del repositorio (`Ubicacion de reglas del proyecto` del config)
- Criterios de aceptacion de la **User Story** (no el "como" de la Task/plan)
- `references/` de esta skill (criterio)
- Clasificacion de la Task (feature vs refactor), la indica quien invoca (plan-execution lee el plan)

## Procedimiento

Ejecutar en orden. No saltar pasos.

### 1. Cargar criterio (`references/`)

1. Leer los references necesarios para el mapeo (ver lista al final).
2. Si el proyecto adapto `references/` respecto al starter, usar **esa** copia local (es la fuente de criterio del repo).
3. Si falta un reference esperado: informar el gap; no inventar matrices largas en este archivo ni en el chat.

### 2. Fase 0 — Stack y omit-list

1. Leer la regla de rol/stack del repo (hechos: lenguaje, framework, ORM, convenciones).
2. Si hace falta, inspeccionar manifiestos (`package.json`, `*.csproj`, etc.) para confirmar tipado, runner y capas disponibles.
3. Armar la **omit-list** del diseno aplicando la politica de `references/decision-matrix.md` a ese stack: que ya garantiza compile-time o tooling y **no** se testea en runtime.

### 3. Spec y rama segun tipo de Task

**Feature / cambio de comportamiento**

- Fuente: **Acceptance Criteria de la US**.
- No usar el plan de la Task como spec de comportamiento.

**Refactor** (el plan preserva comportamiento; sin CA nuevos de feature)

- **No** disenar casos nuevos ni agregar/quitar comportamiento de tests.
- Solo listar tests existentes que requieren **adaptacion mecanica** de superficie de llamada (firma, rename, imports, path del SUT).
- Detalle en `references/decision-matrix.md` (seccion refactor).
- Output: lista de tests a tocar + cambio mecanico (no tabla CA → casos).

**Fix / regresion**

- Ademas de CA violados, seguir `references/regression-bugs.md`.

### 4. Mapear CA → capa → casos (solo feature / fix)

Para cada CA relevante a la Task:

1. Elegir capa minima con confianza real (`references/decision-matrix.md`).
2. Aplicar defaults segun Activity:
   - `Dev BE` → `references/be-defaults.md` (incluye persistencia)
   - `Dev FE` → `references/fe-defaults.md`
   - `Dev` / ambas → combinar segun el alcance del cambio.
3. Respetar la omit-list armada en Fase 0.
4. Definir **casos de uso** por CA: entrada → resultado esperado, derivados del CA (caja negra).

### 5. Output del diseno

Presentar y **parar** para aprobacion de quien invoca.

**Feature / fix** — tabla:

| Columna | Contenido |
|---------|-----------|
| CA | Criterio (o id/resumen) |
| Capa | `unit` o `integration` (integration solo BE; ver `decision-matrix.md`) |
| Casos | entrada → esperado, minimos (sin combinatoria exhaustiva) |
| Tecnica | runner/framework del stack (rol / manifiestos) |
| Archivos | paths estimados a crear/modificar |
| Omit-list | que se omite y por que (stack + decision-matrix) |

`e2e` no es una opcion de capa en v1: si un CA solo se valida con confianza en un journey completo, marcarlo como validacion manual, no asignarle una capa automatizada.

Incluir total estimado de tests. En fixes: caso de regresion o N/A documentado (`regression-bugs.md`).

**Refactor** — lista: test existente → adaptacion mecanica requerida (sin nuevos comportamientos).

No escribir codigo de test en esta skill.

## References (criterio)

Leer solo lo necesario para el mapeo:

- `references/decision-matrix.md` — que SI / que NO; compile-time vs runtime; rama refactor
- `references/be-defaults.md` — defaults backend (incluye persistencia/ORM de diseno de tests)
- `references/fe-defaults.md` — defaults frontend
- `references/regression-bugs.md` — bug → test de regresion (consumido por bug-fix)

Si un reference aun no existe en el paquete, informar el gap y no inventar matrices largas en este archivo.
