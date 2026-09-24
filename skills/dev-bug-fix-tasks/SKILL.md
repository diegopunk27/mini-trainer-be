# Dev Bug Fix Tasks - NestJS CQRS Base

---
name: dev-bug-fix-tasks
description: >
  Planificar y crear Tasks de correccion de bugs en el tracker configurado. Analiza el bug, la US origen, los planes de las tasks hijas y las US relacionadas; clasifica la causa raiz, expone el diagnostico al desarrollador y genera una Task con plan de correccion y estimacion. Trigger: Cuando el usuario quiere convertir un Bug del tracker en una tarea de fix lista para ejecutar.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Planning a bug fix Task from a tracker Bug"
    - "Diagnosing the root cause of a Bug before fixing it"
    - "Creating a fix Task linked to a Bug and its parent US"
---

Usar esta skill para planificar la correccion de un bug: diagnosticar causa raiz, generar Task con plan de desarrollo y estimacion, y opcionalmente encadenar la ejecucion.

## Contexto Compartido Requerido

Antes de empezar, leer:

- `../dev-common/SKILL.md`
- `../dev-common/config/dev-project-config.md`
- Contrato del tracker configurado: `../dev-common/references/tracker-contracts-ado.md` o `../dev-common/references/tracker-contracts-notion.md`

Referencias de esta skill:

- `references/root-cause-guidelines.md`: categorias de causa raiz, niveles de certeza y evaluacion de rules. Cargar antes del Paso 2.
- `references/git-intro-analysis.md`: rastreo del defecto via PR de la feature (ancla) + historial antes/despues en archivos core. Cargar durante el Paso 2 Ronda B.
- `references/bug-fix-plan-format.md`: estructura del plan de correccion y checklist de la Task. Cargar antes del Paso 4.
- `references/bug-fix-plan.example.md`: ejemplo completo (cargar solo si el formato no esta claro).

Skills auxiliares:

- `../dev-estimation/SKILL.md`: estimacion en Paso 4.
- `../dev-plan-execution/SKILL.md`: solo si el usuario confirma ejecutar la correccion en Paso 6.

El proceso tiene un Paso 0 opcional y 6 pasos obligatorios. No avanzar al siguiente sin completar el anterior.

## Inputs

Obligatorios:

- **ID del Bug** en Azure DevOps.

Opcionales:

- Repositorio sobre el que se trabaja (si el proyecto tiene mas de uno).
- Hipotesis del desarrollador sobre la causa (acelera el Paso 2, no reemplaza el analisis).
- Contexto adicional ofrecido en el Paso 0 (IDs relacionados, logs, archivos sospechosos).

Si falta el ID del Bug, pedirlo antes de leer ADO.

## Paso 0 - Contexto inicial (opcional)

Objetivo: evitar relevamiento a ciegas cuando el usuario ya tiene contexto util, y evitar gastar tokens de mas cuando no lo tiene.

Antes de leer nada en ADO (aparte de confirmar el ID del Bug), preguntar:

_"Ademas del Bug, queres pasarme contexto adicional (IDs de otras US/Bugs/Tasks relacionadas, logs, stacktrace, archivos sospechosos, hipotesis propia)? Si no tenes nada puntual, sigo con el relevamiento estandar: Bug + US padre + Tasks hijas + busqueda de codigo."_

- Si el usuario no aporta nada: continuar con el Paso 1 tal como esta definido (comportamiento por defecto, sin cambios).
- Si el usuario aporta contexto: usarlo como punto de partida del Paso 1 (evita busqueda de codigo a ciegas si ya indico archivos; puede acelerar el Paso 2 si aporta logs o stacktrace). No reemplaza la lectura obligatoria del Bug ni de la US padre: igual hay que validar ese contexto contra ADO y el codigo real antes de asumirlo correcto.

## Paso 1 - Contexto del bug y la US

Objetivo: reunir todo el contexto funcional y de implementacion previa.

Acciones:

1. Asumir el rol del repo: cargar la regla de rol/stack indicada en el config. Sin el rol correcto no continuar.
2. Leer el Bug con MCP (`get_work_item`, Project ID del config, `expand: "all"`).
3. Validar que el work item sea tipo `Bug`. Extraer:

- `System.Title`
- `Microsoft.VSTS.TCM.ReproSteps`
- `Microsoft.VSTS.Common.AcceptanceCriteria` (resultado esperado del bug)
- `Microsoft.VSTS.TCM.SystemInfo` (ambiente)
- Commits y PRs vinculados en relations (`ArtifactLink`: `Fixed in Commit`, `Pull Request`)

4. Obtener la US padre desde relations (`parent`). Si no tiene parent, detener y pedir ID de US valido.
5. Leer la US padre (`expand: "all"`). Extraer titulo, descripcion y criterios de aceptacion.
6. Listar Tasks hijas de la US (`child` en relations). Por cada Task, leer `System.Title`, `System.Description` (plan de desarrollo original), `Microsoft.VSTS.Common.Activity` y estado.
7. Buscar en el codigo los archivos mencionados en los planes de las tasks o inferidos del bug (grep / semantic search). Abrir solo los confirmados.

Output esperado (brief de contexto):

- ID y titulo del Bug.
- ID y titulo de la US padre.
- Resumen del defecto (pasos + resultado actual vs esperado).
- Tasks hijas de la US (ID, titulo, Activity, estado) con indicacion de cual parece relacionada al bug.
- Archivos de codigo candidatos identificados.
- Commits/PRs vinculados al Bug en ADO, si los hay.

## Paso 2 - Investigacion progresiva de la causa raiz

Objetivo: alcanzar certeza **Alta** sobre que ocurrio y como corregirlo. No avanzar al Paso 3 sin certeza Alta.

Antes de empezar, leer `references/root-cause-guidelines.md`.

La investigacion es por rondas. Cada ronda solo se ejecuta si la anterior no alcanzo certeza Alta.

**Al cierre de cada ronda (incluida la Ronda A)**, antes de decidir el siguiente paso, presentar al usuario un cierre de ronda con:

- Que se reviso.
- Hipotesis actual y su certeza (Alta / Media / Baja), con evidencia a favor y en contra.
- Que falta especificamente para llegar a certeza Alta.
- Propuesta concreta de la proxima ronda.

Esto no es un "si/no" ciego para continuar: el usuario tiene que poder confirmar el razonamiento, corregirlo, o proponer un camino distinto (saltar de ronda, aportar una pista propia, o cerrar con la certeza actual) en cada corte.

### Ronda A — US, plan y codigo (siempre se ejecuta, sin preguntar antes de empezar)

1. Cruzar CA de la US con el comportamiento reportado: que debia pasar.
2. Revisar planes de Tasks hijas: el flujo del bug, estaba cubierto? que pasos lo omitieron?
3. Inspeccionar archivos candidatos del Paso 1: el codigo implementa lo que el plan pedia?

Presentar el cierre de ronda (formato arriba).
Si certeza Alta → ir a **Sintesis**.
Si no → proponer Ronda B y esperar confirmacion del usuario.

### Ronda B — Git en archivos core

Proponer, apoyado en el cierre de la Ronda A: _"Con el plan y el codigo, mi hipotesis es [...] con certeza [...]. Para confirmarla falta [...]. Queres que analice el historial git de los archivos principales, o preferis otro camino?"_

Si confirma:

- Seguir `references/git-intro-analysis.md`: elegir 1–3 archivos core, anclar el merge/PR de la feature y revisar commits **posteriores** al ancla (otro fix/refactor puede haber roto lo que estaba bien).
- Determinar: **regresion por commit** vs **divergencia especificacion/implementacion** (y en ese caso, que subtipo: nunca implementado / US cambio post-implementacion / Tasks no capturaron el requerimiento).

Presentar el cierre de ronda.
Si certeza Alta → ir a **Sintesis**.
Si no → proponer Ronda C.

### Ronda C — Tasks y US relacionadas

Proponer, apoyado en el cierre de la Ronda B: _"Tampoco pude confirmar con git: [motivo puntual]. Queres que revise Tasks o US relacionadas para ver si el cambio ocurrio en otro contexto?"_

Si confirma:

- Leer US con relacion `Related` en ADO: titulo + CA relevantes al bug.
- Leer Tasks de esas US si apuntan al mismo flujo.

Presentar el cierre de ronda.
Si certeza Alta → ir a **Sintesis**.
Si no → proponer Ronda D.

### Ronda D — Hipotesis del usuario

Proponer: _"No pude identificar la causa con certeza Alta. Con lo investigado hasta aca, mi mejor hipotesis es [...]. Tenes alguna hipotesis o zona de codigo concreta para inspeccionar?"_

Si el usuario aporta pista: investigar esa zona especifica.

Presentar el cierre de ronda.
Si certeza Alta → ir a **Sintesis**.
Si no → Ronda E.

### Ronda E — Guia de debug en runtime

Si tras A–D no se tiene certeza Alta, presentar guia de debugging para reproducir el error en runtime. El objetivo puntual es confirmar o refutar la hipotesis mas probable del cierre de Ronda D, no observar en general:

1. Identificar el punto de entrada del flujo del bug (endpoint, accion de UI, evento).
2. Agregar logs o breakpoints en los archivos core, apuntados a la hipotesis mas probable, para observar el estado en ejecucion.
3. Reproducir el escenario con los ReproSteps del Bug.
4. Registrar: estado observado vs esperado, stacktrace si aplica, valores de variables clave en el punto de falla.
5. Con esa evidencia, volver a Ronda A con hipotesis concreta actualizada.

Esperar que el usuario ejecute el debug y reporte antes de continuar.

### Sintesis (al alcanzar certeza Alta)

Documentar segun `root-cause-guidelines.md`:

- **Causa del defecto**: descripcion concreta de que ocurrio (razonamiento libre, no categoria fija). Solo si certeza Alta; certeza Media solo como hipotesis marcada explicitamente; certeza Baja/Media-Baja no formular.
- **Como se verifico el diagnostico**: pasos concretos de reproduccion (o evidencia equivalente: log, blame, diff) que confirman que la causa identificada es la que produce el defecto — no solo razonamiento. Ejemplo: si la hipotesis es un null pointer, reproducir el escenario y mostrar el valor null en el punto exacto de falla.
- **Red de seguridad que pudo haberlo evitado**: mecanismo ausente concreto (tests, code review, actualizacion de docs, revision del plan, linter). Solo si hay evidencia clara.
- Rastreo git (si aplica de Ronda B): conclusion (regresion / divergencia y subtipo), commit introducctor, ancla.
- Certeza del analisis completo: **Alta** para avanzar al Paso 3. Si no se alcanza, volver al usuario.
- Recomendacion sobre rules: modificar / no / evaluar con el equipo.

## Paso 3 - Exposicion y validacion del usuario

Objetivo: presentar el candidato en forma concisa para que el usuario inspeccione y confirme antes de generar el plan. **No continuar al Paso 4 sin confirmacion explicita.**

Presentar cuatro puntos:

1. **Que ocurrio**: donde falla y que comportamiento produce (archivo/funcion/flujo concreto si se conoce).
2. **Como corregirlo**: enfoque candidato de correccion en 1-2 oraciones.
3. **Por que se genero** (si se conoce): causa raiz con evidencia concreta (commit introducctor, paso omitido en el plan, etc.).
4. **Como se verifico el diagnostico**: los pasos de reproduccion (de la Sintesis del Paso 2) que confirman que esa es la causa real, no una hipotesis sin contrastar.

Pedir al usuario que inspeccione el codigo y la evidencia por su cuenta antes de confirmar.

Si el usuario corrige el diagnostico: actualizar y, si la certeza baja de Alta, volver a la ronda correspondiente del Paso 2.
Si el usuario confirma: continuar al Paso 4.

## Paso 4 - Definicion de la Task de correccion

Objetivo: construir el plan de desarrollo completo para ejecucion por un agente.

Antes de redactar, leer `references/bug-fix-plan-format.md` y `../dev-estimation/SKILL.md`.

Por la Task definir:

- Titulo (prefijo `Fix:` + referencia al bug)
- Activity (`Dev BE`, `Dev FE` o `Dev`)
- Plan de desarrollo segun `bug-fix-plan-format.md`
- Estimacion segun `../dev-estimation/SKILL.md` (arquetipos de "Correccion de bugs", capa-agnostica)

El plan debe incluir obligatoriamente el bloque de **Analisis de causa raiz** documentado en la Description.

Esperar validacion del usuario antes de continuar.

## Paso 5 - Creacion de la Task en Azure DevOps

Seguir el contrato del tracker configurado:

1. Crear la Task con `create_work_item` (Title, Description en HTML, Activity, RemainingWork, OriginalEstimate).
2. Vincular la Task a la US padre con `create_work_item (parentId) / get_parent / get_children`, `type: "parent"`.
3. Vincular la Task al Bug con `create_work_item (parentId) / get_parent / get_children`, `type: "related"` (desde la Task hacia el Bug).

Output esperado: confirmacion breve con ID de la Task creada, US padre y Bug relacionado.

## Paso 6 - Resolucion opcional

Objetivo: encadenar la ejecucion del plan si el desarrollador lo desea.

Preguntar explicitamente: _"Desea proceder con la resolucion del bug ejecutando el plan de la Task creada?"_

Si confirma:

1. Leer `../dev-plan-execution/SKILL.md`.
2. Ejecutar ese flujo con el ID de la Task recien creada.

Si no confirma, cerrar con el resumen del Paso 5.

## Salida

Resumen breve al finalizar:

- ID y titulo de la Task de correccion.
- Bug y US vinculados.
- Causa raiz documentada.
- Si se inicio ejecucion del plan, indicarlo.
