# Dev Estimation - NestJS CQRS Base

---
name: dev-estimation
description: >
  Estimar tareas de desarrollo agentico por semejanza contra un catalogo de arquetipos calibrado con datos reales del proyecto. Reemplaza la estimacion por horas de dev humano (skill estimador), que sobredimensionaba las tareas. Trigger: Cuando hay que estimar una Task del tracker a partir de su plan de desarrollo.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Estimating a tracker task"
    - "Estimating agentic development work in hours"
    - "Matching a task to an archetype for estimation"
    - "Loading RemainingWork estimate for a task"
---

Estimar tareas de desarrollo **agentico** matcheando cada tarea al arquetipo mas parecido de un
catalogo calibrado con el historico real del proyecto, en lugar de calcular desde cero por rounds.

El agente genera todo el codigo y los tests. El desarrollador supervisa, itera y hace un smoke test.
La estimacion es el **tiempo total del desarrollador** y se calibra cada sprint contra el real.

> Contexto portal-BE: este skill reemplaza al `estimador` (horas de dev senior humano) para este
> proyecto. El catalogo (`references/archetype-catalog.md`) arranca del historico REAL compartido
> este proyecto/portal (225 tareas Dev BE, NestJS/CQRS). Trae dos columnas: **base agentica** (la que se usa
> para estimar, conservadora a 0.5h) y **referencia humana** (mediana del modelo viejo — solo
> techo/comparacion, NO base). Estimar SIEMPRE con la base agentica. Calibrar con datos agenticos
> reales de portal-BE via `../dev-sprint-review`. Las tareas FE se estiman en `react-template-base`.

## Contexto Compartido Requerido

- `../dev-common/SKILL.md`
- `../dev-common/config/dev-project-config.md`

## Procedimiento

### Paso 1 - Matchear arquetipo (base)

1. Identificar la **capa**: este repo es **BE** (no hay arquetipos FE en el catalogo; FE se estima en portal-fe).
2. Leer el plan de desarrollo de la tarea (cambios paso a paso).
3. Elegir el **arquetipo mas parecido** en `references/archetype-catalog.md` (taxonomia NestJS/CQRS
   compartida este template). La estimacion es **por semejanza** con el arquetipo, no por calculo.
4. Tomar la **base agentica** del arquetipo (columna "Base agentica", NO la "Ref. humana").

Si la tarea combina dos arquetipos claramente distintos (ej: nueva pagina completa + integracion),
tratarla como **scope grande** (ver catalogo) y/o estimar la suma, no el mayor.

### Paso 2 - Riesgo infra/config (sumable)

Sumar la banda de **riesgo infra/config** del catalogo **solo si** la tarea toca alguno de estos, con
incertidumbre real de debugging:

- Auth / authorizer / JWT en API Gateway
- API Gateway / HTTP API / CORS / URL base entre capas
- Deploy de un servicio o recurso AWS por primera vez
- IaC nueva (template.yaml, policies IAM nuevas, ruta protegida nueva)
- Primer uso de una libreria/servicio sin patron previo en el repo

Es el **unico driver historico de blowup** del proyecto. Si la tarea reutiliza un patron ya existente,
**no** aplica.

### Paso 3 - Redondeo final

```
Estimacion = (base + riesgo infra) redondeado HACIA ARRIBA a 0.5h, minimo 0.5h
```

**Sin buffer porcentual.** El piso de 0.5h ya actua como holgura (la mayoria de las tareas reales caen
en 0.15-0.5h). Esto se revisa en la calibracion de cada sprint.

## Casos especiales

- **Correccion de PRs**: cuando la suma de horas de **todas las tareas BE o FE de una US** supera 4h,
  agregar `horas_correccion = floor(total_horas_dev / 4)` como tarea aparte. Separar BE y FE si ambas
  superan el umbral.
- **Tareas de impacto**: estimar con los mismos criterios (suelen ser mas simples). Contar en la suma
  para correccion de PRs.
- **Correccion de bugs** (invocada desde `../dev-bug-fix-tasks/SKILL.md`): **capa-agnostica** —
  omitir el Paso 1.1 (identificar BE/FE), matchear directo contra `references/archetype-catalog.md`
  (seccion "Correccion de bugs") segun el estado del diagnostico (causa identificada con poco o mucho
  debug de verificacion, o exploratorio). El resto del procedimiento (riesgo infra, redondeo) aplica igual.
- **Revision de codigo (por US)**: estimar una tarea de revision por US por **buckets de tamano** (N
  archivos + ediciones vs nuevos, extraidos de los planes de desarrollo de las Tasks), no por formula.
  Ver `references/archetype-catalog.md` (seccion "Revision de codigo"). Distinta de "Correccion de PRs".

## Campo de Azure DevOps

Campo: **Microsoft.VSTS.Scheduling.RemainingWork** (horas, decimales con `.`). Cargar tambien
`OriginalEstimate` con el mismo valor.

## Formato de salida

```markdown
### Estimacion: [nombre tarea]

- **Capa**: BE / FE
- **Arquetipo**: [nombre] (semejante a #IDs del catalogo) -> base X.Xh
- **Riesgo infra/config**: +X.Xh [motivo] | No aplica
- **Subtotal**: X.Xh
- **Estimacion final** (redondeo 0.5h hacia arriba): **X.Xh**
- **Riesgos principales**: [que podria inflar la estimacion]
```

## Calibracion (modo aparte)

Esta skill **posee** el catalogo y su calibracion. Al estimar (Pasos 1-3 arriba), no cargar el
procedimiento de calibracion.

La calibracion NO se hace por tarea cerrada, sino **por sprint** a partir del CSV exportado de Azure
DevOps, tipicamente invocada por `../dev-sprint-review` (su anexo de calibracion), que prepara el
lote de tareas cerradas y delega aca:

1. Cargar `references/calibration.md` (procedimiento completo + contrato de entrada del lote).
2. Seguir ese procedimiento: clasificar por arquetipo -> comparar real vs Base agentica -> **proponer
   primero en detalle** los ajustes (por que, que se haria, impacto, limitacion) -> aplicar en
   `references/archetype-catalog.md`, `references/calibration-log.md` y este `SKILL.md` **solo tras la
   aprobacion explicita del usuario**.

Estado actual: el catalogo tiene taxonomia y techo humano compartido con este proyecto, pero **aun no hay datos
agenticos reales de portal-BE**. Prioridad de calibracion: (1) confirmar las bases agenticas con los
primeros sprints hechos con agente; (2) reforzar arquetipos con N<=5 (command, query, repository, service,
refactor, filtros); (3) la banda de riesgo infra/config; (4) los arquetipos nuevos de "Correccion de bugs"
(N = "-", ver `references/archetype-catalog.md`).

## Referencias

- `references/archetype-catalog.md`: **datos** — arquetipos BE, banda de riesgo infra, arquetipos de
  correccion de bugs y reglas de PR/impacto. Se lee al estimar (arquetipo + Base agentica).
- `references/calibration.md`: **procedimiento** de calibracion (cargar solo al calibrar).
- `references/calibration-log.md`: muestreo historico humano y log de calibracion agentica por sprint.
