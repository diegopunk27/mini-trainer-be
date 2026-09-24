# Dev Code Review - NestJS CQRS Base

---
name: dev-code-review
description: >
  Ejecutar un code review a partir de una Task del tracker o de un diff directo. Revisa cumplimiento de reglas (rol + architecture), huecos en el desarrollo, impacto en consumidores/funcionalidad no contemplada, riesgos y bugs potenciales, optimalidad/simplicidad, decisiones de stack y oportunidades de refactor. Soporta Task mode (review completo) y Diff mode (review acotado). Trigger: Cuando el usuario quiere revisar codigo con criterio de ingeniero senior, con o sin PR/Task del tracker.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Reviewing a tracker Task before closing it"
    - "Running a Task mode or Diff mode code review"
    - "Evaluating a diff against architecture rules and stack decisions"
---

Revisar codigo como un ingeniero senior del stack que **no escribio** ese codigo.

Dos modos de entrada:

- **Task mode**: input = Task ID. Lee Task, US padre, plan de desarrollo y reglas referenciadas. Review completo sobre los 6 ejes.
- **Diff mode**: input = diff. No requiere Task. Review acotado: sin verificacion de CA, plan ni alcance.

Si se invoca desde el flujo de ejecucion de plan: reutilizar Task, US padre y diff ya cargados. No volver a pedirlos.

## Contexto Compartido Requerido

- `../dev-common/SKILL.md`
- `../dev-common/config/dev-project-config.md`
- Contrato del tracker configurado: `../dev-common/references/tracker-contracts-ado.md` o `../dev-common/references/tracker-contracts-notion.md`
- La regla de rol/stack del repositorio.
- `../dev-testing-strategy/SKILL.md` (alineacion de cobertura de tests; criterio en sus `references/`).

## Principio rector: revisar como codigo ajeno

Este principio aplica **siempre**, incluso si el mismo agente implemento el codigo.

- **Descartar el contexto de implementacion.** Olvidar cualquier razonamiento, intencion o justificacion previa de como se escribio el codigo. No usar ese contexto para defender el diff.
- **Unica fuente de verdad**: el diff, las reglas (rol + architecture), el rol/stack y, en Task mode, los test cases / CA de la US y el plan. Nada mas cuenta como justificacion.
- **La intencion no escrita no vale.** Si algo no esta en el diff ni respaldado por reglas/CA, es un hallazgo, no un supuesto valido.
- **Buscar problemas activamente.** No aprobar lo propio sin rigor. Partir de la hipotesis de que hay algo por mejorar.
- **Evidencia obligatoria.** Todo hallazgo cita archivo/linea concretos + la regla, CA/test case o razonamiento tecnico que lo sostiene. Si no se puede citar esa evidencia especifica, no es un hallazgo: descartarlo, no reportarlo "por las dudas".
- **Sin relleno.** Preferir pocos hallazgos de alto impacto a muchos triviales. No inflar severidad Menor/Nit ni inventar observaciones para que un eje no quede vacio.
- **Postura desafiante.** Codigo prolijo o bien escrito no exime de escrutinio. Buscar activamente el caso en que la logica falla en vez de confirmar que "tiene sentido".

## Preparacion (antes de revisar)

Ejecutar en orden. La meta es ponerse en el rol y cargar exactamente el contexto necesario, ni mas ni menos.

1. **Resolver el repo en config.** Obtener `Repository ID`, `Base branch` y `Ubicacion de reglas del proyecto` del repo en `dev-project-config.md`.
2. **Ponerse en el rol.** Leer la regla de rol/stack del repo. Adoptar la mentalidad del ingeniero senior de ese stack (lenguaje, framework, arquitectura, convenciones).
3. **Identificar el stack concreto.** Si el rol no lo deja claro, confirmar con los manifiestos del repo (`package.json`, `*.csproj`, `pom.xml`, `requirements.txt`, `go.mod`, etc.) para saber lenguaje, framework, librerias disponibles y versiones.
4. **Cargar reglas de architecture.** Leer las reglas de la `Ubicacion de reglas del proyecto`:
   - Task mode: las reglas referenciadas en el plan + las reglas base de arquitectura.
   - Diff mode: las reglas relevantes a los archivos tocados por el diff.
5. **Alinear cobertura con `dev-testing-strategy`.** Leer `../dev-testing-strategy/SKILL.md` y, como minimo, `references/decision-matrix.md` (omit-list / compile-time vs runtime). Si Activity o el diff indica BE o FE, cargar tambien `be-defaults.md` o `fe-defaults.md` segun corresponda. **No** buscar overlay `testing-strategy.mdc` ni inventar matrices fuera de esos references. Armar la omit-list del review con rol + manifiestos + decision-matrix (misma politica que el diseno de tests).
   - **[Task mode, Activity `Dev BE` o diff toca entities/migraciones/repositorios]** Cargar ademas `references/be-persistence-review.md`. FE puro: no aplica.
6. **[Task mode] Cargar Task + US padre + test cases.** Extraer del plan las reglas referenciadas y el alcance. De la US: los **CA impactados por el diff** y, si existen, los **test cases vinculados a la US** (titulo y descripcion bastan; no hace falta el paso a paso). Los test cases son la spec validada de cobertura; si no existen, usar los CA directamente. Tomar solo los impactados por el diff.
7. **Obtener el diff y mapear capas.** Por contexto (si viene del flujo) o `git --no-pager diff <base-branch>...HEAD`, usando el `Base branch` del config como destino por defecto. Si el usuario dio una rama sin indicar contra que branch compararla y no es evidente que sea el `Base branch` del config (release, hotfix, rama apilada sobre otra), confirmar antes de correr el diff (ver "Preguntas antes de revisar"). Asociar cada cambio a su capa para aplicar las reglas que corresponden.

En Task mode, pasos 2-6 pueden lanzarse en un solo lote de llamadas en paralelo (el mapeo de capas del paso 7 depende del diff).

## Preguntas antes de revisar (solo si bloquean el analisis)

Si tras la preparacion queda una ambiguedad real que impide evaluar correctamente el diff, preguntar al usuario antes de generar el informe. Ejemplos validos:

- CA o test cases contradictorios entre si o con el diff, sin forma de inferir cual es el comportamiento correcto.
- Archivo o regla referenciada en el plan que no existe y no hay equivalente claro.
- Diff mode sin indicacion de que reglas/capa aplican (ej. ambiguo entre dos stacks en un monorepo).
- Alcance de la Task ambiguo para decidir si un cambio esta fuera de scope o no.
- Rama base de comparacion no confirmada: el usuario dio una rama de trabajo sin indicar contra que branch compararla, y no es evidente que sea el `Base branch` del config.

**No** preguntar para pedir permiso de ser riguroso, confirmar si "esta bien" antes de reportar un hallazgo, o suavizar la evaluacion. Con informacion suficiente, el review es unilateral.

## Ejes de evaluacion

| #   | Eje                                        | Task mode | Diff mode |
| --- | ------------------------------------------ | --------- | --------- |
| 1   | Cumplimiento de reglas (rol + architecture)| ✓         | ✓         |
| 2   | Huecos en el desarrollo                    | ✓         | parcial   |
| 3   | Impacto y riesgos                          | ✓         | ✓         |
| 4   | Optimalidad y simplicidad                  | ✓         | ✓         |
| 5   | Decisiones segun el stack                  | ✓         | ✓         |
| 6   | Oportunidades de refactor                  | ✓         | ✓         |

En Diff mode el eje 2 se limita a cobertura del comportamiento del diff y casos borde (no hay CA, plan ni alcance que verificar). El eje 3 (Impacto y riesgos) aplica igual en ambos modos: es donde se concentra la deteccion de bugs introducidos y de funcionalidad/consumidores afectados y no contemplados.

Ver `references/code-review-guidelines.md` para el detalle de cada eje, el formato del informe y la seccion "Alcance" (que resuelve este review vs que se delega a linter/compilador/SAST/CI).

## Severidad y recomendacion

- **Severidad por hallazgo**: `[Bloqueante]`, `[Mayor]`, `[Menor]`, `[Nit]`.
- La recomendacion final deriva de la severidad maxima:
  - Bloqueante -> Bloquear; Mayor -> Solicitar cambios; Menor -> Cambios menores; solo Nit o nada -> Aprobar.
- **Acotado al diff**: evaluar los cambios, no el codigo preexistente no tocado. Las oportunidades de refactor (eje 6) pueden mirar mas alla del diff, pero se marcan como sugerencia futura, no como bloqueo.
- **Accionable y conciso**: una linea por observacion, con archivo y como corregir. Sin ruido.

## Salida

- **Task mode**: informe completo con los 6 ejes.
- **Diff mode**: informe reducido. Omitir verificacion de CA, plan y alcance; el eje 2 reporta cobertura del diff y casos borde; el eje 3 (Impacto y riesgos) se reporta igual que en Task mode.

Formato exacto en `references/code-review-guidelines.md`.
