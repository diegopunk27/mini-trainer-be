# Decision matrix — que SI / que NO

Estrategia para evitar cobertura innecesaria y mantener una suite **mantenible**, no exhaustiva.
Aplicar antes de los defaults BE/FE. Los hechos de stack (tipado, runner, ORM) salen del rol / manifiestos; esta matriz define la **politica**.

## Principio

Spec = **CA de la User Story**. Cada CA mapea a la **capa minima** que da confianza real. No duplicar la misma garantia en varias capas. Cobertura minima que da confianza, no cobertura maxima posible.

## Capas (solo dos automatizadas en v1)

| Capa | Aplica a | Que es | Cuando |
|------|----------|--------|--------|
| **Unitario** | BE y FE | Logica aislada de una unidad (funcion, regla, use case, hook, validador), dependencias externas dobladas | Siempre que haya logica: calculo, rama, transformacion, validacion de negocio |
| **Integracion** | **Solo BE** | Test que le pega a un endpoint **activo** (via HTTP/handler real) contra la app real, con su persistencia si aplica | Cada endpoint activo que expone un CA |
| E2E | — | **Pendiente. No forma parte de esta skill en v1** (ver seccion abajo) | — |

FE no tiene capa de integracion en este starter: la interaccion con la API se cubre en unit doblando la red (ver `fe-defaults.md`).

## 1. Unitario

Regla simple: **si hay logica, se testea aislada.** Siempre cubrir:

- Happy path.
- Casos borde relevantes al CA.
- Excepciones / errores que la logica puede lanzar o devolver.

### Combinatoria (filtros, combinaciones de parametros, variantes)

**No testear todas las combinaciones.** Cobertura minima representativa:

- Un caso por regla/rama distinta, no el producto cartesiano de todas las variables.
- Ejemplo: un filtro con 3 parametros opcionales no son 8 tests (2³); son los casos que ejercitan cada rama de la logica (sin filtro, un filtro, todos los filtros, filtro que no matchea) — 3 a 5 casos, no todas las combinaciones.
- Si despues aparece un bug en una combinacion no cubierta: se agrega ese test puntual (ver `regression-bugs.md`). La suite crece **reactivamente** ante fallas reales, no preventivamente por combinatoria.

## 2. Integracion (solo BE)

Definicion operativa: un test que le pega al **endpoint activo** (a traves del framework real, no mockeando el handler) y verifica el comportamiento observable end-to-end de esa capa BE (incluyendo persistencia si el CA lo exige).

### Que cubrir

- **Happy path** del endpoint.
- **Excepciones principales**: las 1-2 excepciones de negocio mas relevantes del CA (ej: recurso no encontrado, conflicto/duplicado). No barrer todos los codigos HTTP posibles (400 de cada campo, 401, 403, etc.) si no son el foco del CA.
- **Estabilidad de la salida**: fijar la forma de la respuesta (shape/status) para detectar cambios no intencionales en contratos ya expuestos. Esto es un assert de "la respuesta tiene esta forma", no de reglas de validacion de entrada.

### Que NO cubrir aqui

- Todas las combinaciones de query params / filtros (eso ya se resolvio en unit, si la logica esta en una unidad separada del handler).
- Cada codigo de error HTTP posible por cada campo invalido — eso es responsabilidad de la libreria de validacion declarativa del stack (class-validator, Zod, FluentValidation, etc.), no de un test de integracion por campo. Ver `be-defaults.md` para el detalle de como delegar esto.
- Logica de negocio pura que ya tiene su unit — no repetir el mismo caso en integracion "por si acaso".

### Ambito

Solo **endpoints activos** (expuestos y usados). No armar integracion para codigo no expuesto, deprecado o sin consumidor.

## 3. E2E — pendiente, fuera de esta skill en v1

No hay automatizacion E2E en este starter. Decision explicita:

- Esta skill **nunca** asigna `capa = e2e` en su output de diseno.
- El diseño E2E (si en el futuro se automatiza) pertenece a un flujo separado, probablemente armado desde el contenido de la User Story y con ownership de QA — no es parte de `dev-plan-execution` ni de esta skill.
- Si un CA solo se validaria con confianza en un journey completo: no inventar un test automatizado. Marcarlo como **flujo a validar manualmente** en la seccion correspondiente del plan/Task (no bloquea el diseño de unit/integracion).

> **portal-BE**: el proyecto SI tiene tests E2E propios (ver skill `testing` y `.cursor/rules/e2e-testing-guidelines.mdc`), pero fuera del alcance de esta skill: el diseno E2E se resuelve con esas guias, no aca.

## Compile-time vs runtime (omit-list)

Armar la omit-list del diseno cruzando el rol/manifiestos con esta tabla:

| Si el stack tiene… | Omitir en tests de runtime |
|--------------------|----------------------------|
| Tipado estatico estricto (TS strict, C#, etc.) | Asserts de "shape" / tipo de props o DTOs que el compilador ya impone |
| Validacion declarativa de entrada (class-validator, Zod en boundary, FluentValidation) | Testear cada campo invalido en integracion; la libreria ya lo garantiza. En integracion, a lo sumo **un** caso que confirme que la validacion esta conectada al endpoint |
| ORM / migraciones | Tests por columna, nullability campo a campo, o drift entity↔migracion (eso es **review BE**, no diseno de tests) |

Si el rol no deja claro el tipado/validacion/ORM: inspeccionar manifiestos; ante duda, **no** omitir (mejor un test de mas que un hueco).

## Change coverage por CA

1. Listar CA de la US impactados por la Task.
2. Por cada CA: capa (unit y/o integration BE) + casos minimos (entrada → esperado) derivados del texto del CA.
3. Si un CA no aporta comportamiento verificable automatizable (solo copy, solo infra, o solo se puede validar en journey completo): marcarlo N/A o "validacion manual" con motivo.

## Anti-espejo del agente

Prohibido al disenar (y al escribir tests en plan-execution):

- Inventar el "esperado" mirando la implementacion actual.
- Ajustar el caso para que pase el codigo existente.
- Agregar casos que no salen del CA / US (salvo regresion de bug documentada: ver `regression-bugs.md`).
- Agregar cobertura combinatoria "por si acaso" en vez de esperar una falla real.

El diseno fija el comportamiento **antes** de implementar. El codigo se adapta al diseno, no al reves. La suite crece por CA y por regresion real, no por combinatoria preventiva.

## Tarea de refactor

Si el plan de la Task es refactor (preserva comportamiento; no CA nuevos de feature):

- **No** armar tabla CA → casos nuevos.
- **No** agregar ni quitar comportamiento de tests.
- Solo listar tests existentes que requieren **adaptacion mecanica** de superficie de llamada (firma, rename, imports, path del SUT).
- Si el plan pide caracterizacion explicita como paso: eso es trabajo del plan, no diseno emergente de esta matrix.
