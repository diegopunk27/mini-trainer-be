# Dev Plan Execution - NestJS CQRS Base

---
name: dev-plan-execution
description: >
  Ejecutar el plan de desarrollo de una Task del tracker ya definida. Obtiene la Task y su US padre, carga contexto, disena tests desde los criterios de aceptacion, ejecuta la implementacion paso a paso aplicando las validaciones del rol del repo y cierra con testing y compilacion. Trigger: Cuando el usuario quiere implementar una tarea cuyo plan ya esta escrito.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Executing a tracker task development plan"
    - "Implementing a task from its tracker plan"
    - "Running step-by-step development of a planned task"
---

Input: ID de Task del tracker (numerico ADO o `PREFIX-123`).
El plan ya contiene: archivos clave, reglas aplicables, pasos de implementacion y flujos a validar.
**No regenerar el plan. Ejecutar lo que dice.**

## Contexto Compartido Requerido

- `../dev-common/SKILL.md`
- `../dev-common/config/dev-project-config.md`
- Contrato del tracker configurado: `../dev-common/references/tracker-contracts-ado.md` o `../dev-common/references/tracker-contracts-notion.md`
- La regla de rol/stack del repositorio (validaciones por iteracion y testing de cierre).
- `../dev-testing-strategy/SKILL.md` (diseno de tests en Fase 2).
- `../dev-code-review/SKILL.md` (solo si el usuario opta por el code review en Fase 5.5).
- `references/execution-notes-guidelines.md` (que tipo de comentarios registrar en Fase 6 Parte C).

## Fase 0 - Obtener Task, US padre y contexto relacionado

1. Obtener la Task con `get_work_item` (`id`, `project` del config, `expand: "all"`). El plan esta en `System.Description`.
2. Obtener la US padre desde las relations (link parent). Extraer `System.Title`, `System.Description` y `Microsoft.VSTS.Common.AcceptanceCriteria`.
3. Guardar los **CA** de la US: son la base del diseno de tests en Fase 2. Excepcion: las tareas de refactor no aportan CA nuevos (ver Fase 1).
4. Leer las **relaciones directas** de la Task (un solo nivel), segun el contrato del tracker configurado (Relaciones entre Work Items):
   - Tareas `predecessor` de esta Task: leer su `System.Title` y `System.Description` (plan) para conocer que dejaron implementado antes. Es el contexto del que parte esta tarea.
   - Otras tareas hermanas de la US solo si la Task las referencia explicitamente.
   - No expandir mas de un nivel ni seguir la cadena completa de precedentes.
5. Armar un **mapa mental** y resumirlo en 2-4 lineas: que hace esta Task, sobre que CA de la US aplica y con que dejaron las tareas predecesoras. Este resumen es el punto de partida.

Si no tiene parent o CA: informar al usuario y preguntar.

Continuar automaticamente a Fase 1.

## Fase 1 - Entender el plan, clasificar la tarea y verificar viabilidad

1. Leer el plan de desarrollo y entenderlo end-to-end.
2. Leer los archivos de "Archivos clave". No leer extras salvo ambiguedad.
3. Leer las reglas indicadas en "Reglas de arquitectura aplicables" (desde la `Ubicacion de reglas del proyecto` del config). Las reglas base de desarrollo siempre aplican. No cargar reglas no listadas.
4. Clasificar el tipo de tarea:
   - **Feature / cambio de comportamiento**: los tests se disenan desde los CA (Fase 2).
   - **Refactor**: preserva comportamiento. El plan ya trae tecnica, pasos y precondicion de tests de caracterizacion. No mezclar cambios funcionales. Los tests son de caracterizacion (fijan el comportamiento actual), no derivados de CA.
5. Verificar viabilidad: comparar plan vs codigo actual.

Criterio de divergencia:

- **Adaptar y continuar**: renombres, ubicaciones distintas, imports diferentes, ajustes menores.
- **Frenar e informar**: archivo no existe, estructura cambio significativamente, approach no viable, refactor no contemplado.

**>> PAUSA CONDICIONAL - FIN FASE 1**

- Si hay divergencias bloqueantes o dudas sobre alcance, contratos o comportamiento esperado: presentarlas y esperar respuesta del usuario. No avanzar con supuestos sin confirmar.
- Si todo esta claro: presentar en 1-2 lineas que realizara la tarea y continuar automaticamente a Fase 2.

## Fase 2 - Diseno de tests automatizados (define el comportamiento esperado)

Objetivo: fijar QUE se valida y el resultado esperado ANTES de implementar. Esto garantiza que los tests sean caja negra: el comportamiento esperado se decide desde los CA/interfaces, no desde el codigo.

Solo tests automatizados: no incluir pruebas manuales en este diseno.

1. Tomar los CA guardados en Fase 0 (o el comportamiento a preservar, si es refactor).
2. Leer `../dev-testing-strategy/SKILL.md` y seguir su procedimiento con esos CA (y la clasificacion feature/refactor de Fase 1). No duplicar matrices ni inventar criterio aqui: el criterio vive en los `references/` de esa skill.
3. Usar el output de la skill como diseno de tests (tabla CA -> capa -> casos -> tecnica, omit-list, archivos estimados; o lista de adaptaciones mecanicas si es refactor).

Los tests NO se escriben aqui; se escriben por paso en Fase 4 a partir de estos casos de uso.

Output:
- El que define `dev-testing-strategy` (tabla o lista de adaptaciones mecanicas).

**>> PAUSA OBLIGATORIA - FIN FASE 2**
Presentar el diseno de tests automatizados al usuario.
Si la tarea es setup/infraestructura y no aplican tests automatizados: notificarlo explicitamente y esperar confirmacion.
Si el usuario pide ajustes: aplicarlos y volver a presentar.
No avanzar a Fase 3 sin aprobacion explicita del diseno.

## Fase 3 - Presentar pasos y definir iteracion

1. Presentar pasos de "Cambios a realizar" tal cual (con ajustes de Fase 1 si los hubo). No agregar ni reordenar sin justificacion.
2. Marcar pasos con riesgo alto o incertidumbre.
3. Junto a cada paso: los casos de uso del diseno (Fase 2) que ese paso debe dejar cubiertos.
4. Cargar el plan de desarrollo al agente.

**>> PAUSA OBLIGATORIA - FIN FASE 3**
Preguntar:
- Modo de ejecucion: todo junto / por grupos.
- En que paso desea pausar para revision de codigo (por defecto: ultimo paso).

No iniciar Fase 4 sin confirmacion explicita y sin saber el paso de revision.

## Fase 4 - Ejecutar implementacion

Principios: cambio minimo, respetar arquitectura, no inventar.

**No correr la compilacion/build completo en cada paso.** Se corre en Fase 5.

Por cada paso:

1. Presentar los casos de uso del diseno (Fase 2) que este paso cubrira y los tests que se escribiran (antes de implementar).
2. Escribir los tests del paso a partir de esos casos de uso, tratando la futura implementacion como **caja negra**: usar solo firmas e interfaces publicas, nunca la logica interna. El resultado esperado sale del diseno, no del codigo.
   - Prohibido: escribir un test mirando la implementacion para que pase, o ajustar el esperado a lo que el codigo ya hace.
3. Implementar los cambios de codigo del paso.
4. Ejecutar las **Validaciones por iteracion** definidas en la regla de rol del repositorio (autofix de linter, lint, tests asociados, etc.).
5. `ReadLints` -> corregir errores residuales.
6. Continuar al siguiente paso sin reportar resultados intermedios.

**>> PAUSA EN PASO DESIGNADO**
Al completar el paso indicado en Fase 3 (o el ultimo si no se especifico uno): pausar para revision.
Presentar: resumen de cambios realizados, tests escritos y estado de validaciones.
Esperar confirmacion del usuario para continuar a Fase 5.

Si hay problemas en cualquier paso: frenar, reportar y proponer solucion. Esperar decision. Fuera del plan -> informar y pedir aprobacion. Bug no relacionado -> reportar, no corregir.

## Fase 5 - Testing de cierre

1. Presentar que se validara: suite completa, integracion/e2e si aplica, compilacion/build.
2. Correr el **Testing de cierre** definido en la regla de rol del repositorio. Si falla: corregir.
3. Si hay gap entre implementacion y CA: frenar y reportar.

**>> PAUSA OBLIGATORIA - FIN FASE 5**
Presentar:
- Resultado del testing de cierre.
- **Flujos manuales a verificar**: happy paths principales que el usuario debe probar manualmente para confirmar estabilidad una vez finalizado el desarrollo. Solo lo critico; no es una suite exhaustiva (para eso existen los tests automatizados).

Esperar confirmacion del usuario para continuar a Fase 5.5.

## Fase 5.5 - Code Review (opcional)

Antes de la retroalimentacion, ofrecer un code review de lo implementado.

**>> PAUSA - PREGUNTA**
Preguntar al usuario si desea ejecutar un code review de la Task antes de cerrar.

- Si **no**: continuar a Fase 6.
- Si **si**: ejecutar `../dev-code-review/SKILL.md` en Task mode, reutilizando Task, US padre y diff ya cargados (no volver a pedirlos).
  - Aplicar el **principio rector** del code review: revisar como codigo ajeno, descartando todo el razonamiento de implementacion de las Fases 1-5. La unica fuente de verdad es el diff, las reglas (rol + architecture) y los CA. La intencion de implementacion no justifica el codigo.
  - Presentar el informe completo al usuario.
  - Si hay hallazgos `[Bloqueante]` o `[Mayor]`: preguntar si desea corregirlos antes de continuar. Las correcciones siguen cambio minimo y re-validan (Validaciones por iteracion + testing de cierre del rol). Anotar los cambios como desvios para la Fase 6.

Continuar a Fase 6 una vez resuelto.

## Fase 6 - Retroalimentacion (reglas y plan en ADO)

Se ejecuta siempre al final. Dos frentes: reglas del proyecto y fidelidad del plan de la Task en Azure DevOps.

### Registro durante la ejecucion (Fases 1-5)

Ir anotando desvios respecto al plan original obtenido en Fase 0 (`System.Description` de la Task), sin interrumpir el flujo:

- Adaptaciones de viabilidad (Fase 1).
- Ajustes al diseno de tests aprobados (Fase 2).
- Cambios en pasos, orden o alcance acordados con el usuario (Fases 3-4).
- Archivos, rutas o reglas distintas a las listadas en el plan.
- Pasos omitidos o agregados con aprobacion explicita.
- Flujos manuales o smoke tests que difieren de "Flujos a validar por el desarrollador".
- Cualquier comentario relevante sobre la tarea que valga la pena dejar registrado aunque no cambie el plan (bloqueantes, dudas resueltas, decisiones tomadas sobre la marcha, deuda tecnica notada, etc.) — ver `references/execution-notes-guidelines.md` para el criterio completo. Este tipo de registro alimenta la Parte C, no necesariamente la Parte B.

### Parte A - Reglas

El proyecto arranca con pocas reglas y se construyen incrementalmente: capturar patrones para mantener cohesion y guiar trabajos futuros similares.

**Reactivo** (algo fallo o falto guia):

- El usuario corrigio algo -> una regla debio prevenirlo? Si es ambigua o no existe: proponer mejora.
- El agente busco codigo fuera del plan -> patron no documentado.
- El agente asumio sin respaldo en reglas -> proponer documentar.
- Informacion desactualizada en reglas vs codigo real.

**Proactivo** (se establecio algo que conviene fijar):

- La implementacion establecio o consolido un patron (estructura, organizacion de capas, naming, enfoque de una solucion) que conviene documentar como lineamiento para que el proximo trabajo similar lo siga.

Criterio: **solo proponer lineamientos importantes y reutilizables**. Vara alta: evitar micro-reglas o detalles triviales que generan ruido. Mejor pocas reglas solidas que muchas debiles.

Maximo 3-5 propuestas con evidencia concreta. Si el usuario corrigio algo y se reporta "sin propuestas": revisar de nuevo.

### Parte B - Plan de desarrollo en la Task

Objetivo: si la ejecucion desvio del plan en ADO, reflejarlo en la Task para que re-ejecuciones, code reviews y tareas similares partan de lo implementado.

1. Contrastar plan original (Fase 0) vs lo ejecutado usando el registro de desvios.
2. Clasificar cada desvio:
   - **No relevante**: detalle menor que no cambia como re-ejecutar la tarea (ej. renombre local ya cubierto por adaptacion menor en Fase 1).
   - **Relevante**: cambia archivos clave, pasos, reglas aplicables, flujos a validar, tecnica/approach, o dejaria obsoleto el plan para un re-run.
3. Si hay desvios relevantes: proponer actualizacion de `System.Description` manteniendo la estructura del plan (secciones 1-5 segun `../dev-tasks/SKILL.md`). Integrar los cambios en las secciones correspondientes; evitar duplicar el plan entero en el chat.
4. Si no hay desvios relevantes: indicarlo explicitamente.

**No escribir en ADO sin confirmacion.** Seguir `../dev-common/SKILL.md` (propuesta -> confirmacion -> escritura MCP).

### Parte C - Comentarios de la tarea (changelog, opcional)

Objetivo: dejar una seccion de **comentarios sobre la tarea** (contexto de la ejecucion que **no** cambia como re-ejecutarla, por eso no entra en la Parte B) valiosa para quien lea la Task despues y para retro de sprint (`../dev-sprint-review/SKILL.md` la lee para detectar patrones).

Antes de este paso, cargar `references/execution-notes-guidelines.md`: ahi esta el criterio y los tipos de comentario que suelen aportar valor (bloqueantes, dudas resueltas, decisiones tomadas sobre la marcha, deuda tecnica notada, etc. — no es una lista cerrada).

1. Si durante Fases 1-5 surgio algo que encaje en esos criterios: redactar un comentario breve (1-2 lineas) con el tema y el contexto o resolucion.
2. Preguntar siempre al usuario, incluso si no se detecto nada claro: *"Ademas del plan, queres agregar algun comentario sobre como fue la ejecucion de esta tarea?"* Si el agente detecto algo en el paso 1, proponer el texto en lugar de preguntar en blanco.
3. Si hay contenido (detectado o aportado por el usuario): agregar como **entrada nueva** en una seccion `Notas de ejecucion` al final de la Description (crearla si no existe todavia). Es un **changelog**: nunca reescribir, resumir ni borrar entradas anteriores de esa seccion, solo agregar una `<li>` nueva al final de su lista.
   Formato de entrada: `[Sprint o fecha] - [tema]: [comentario breve]`.
4. Si no hay nada que agregar y el usuario tampoco aporta nada: omitir. No crear la seccion vacia ni forzar un comentario sin contenido real.

**No escribir en ADO sin confirmacion.**

### Output unificado

```
Retroalimentacion:

## Reglas
1. [CREAR|EDITAR] [regla] - [evidencia] -> [lineamiento propuesto]
2. ...
(o "Sin propuestas relevantes.")

## Plan de la Task (#<id>)
(o "Plan alineado con la ejecucion; sin actualizacion sugerida.")

Desvios relevantes:
- ...

Cambios propuestos en Description:
- [seccion]: [antes] -> [despues]
- ...

## Comentarios de la tarea (#<id>)
(o "Sin comentarios para agregar.")

Entrada propuesta para `Notas de ejecucion` (changelog, se agrega sin pisar las anteriores):
- [Sprint o fecha] - [tema]: [comentario]
```

**>> PAUSA OBLIGATORIA - FIN FASE 6**

Presentar el output completo. Esperar decision del usuario:

- **Reglas:** por cada propuesta aceptada, co-crear o editar la regla (acordar contenido) y guardarla en la `Ubicacion de reglas del proyecto` del config.
- **Plan:** si hay actualizacion sugerida, preguntar si desea aplicarla en el tracker. Solo con confirmacion explicita: actualizar la Task con `update_work_item` (reemplazar la seccion del plan o `System.Description` en HTML valido: `<p>`, `<ul>`, `<li>`, `<strong>`), sin modificar titulo, estado, estimacion, iteration, asignado ni relaciones. Confirmar ID de la Task y resumir que secciones quedaron actualizadas. Leer el contrato del tracker configurado.
- **Comentarios de la tarea:** si hay una entrada propuesta (detectada o del usuario), preguntar si desea agregarla. Solo con confirmacion explicita: usar `append_execution_note` para agregar la entrada al changelog de `Notas de ejecucion` (crearla si no existe), sin reescribir notas anteriores ni el resto del plan. Confirmar ID de la Task y la entrada agregada.

## Reglas generales

- No regenerar el plan. Ejecutar lo que dice.
- Minimizar tokens: no repetir el plan, ser conciso.
- No tocar fuera del scope del plan.
- Preguntar ante incertidumbre.
- Las reglas de arquitectura del proyecto prevalecen sobre las reglas base.
