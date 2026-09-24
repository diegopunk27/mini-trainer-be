# Dev Tasks - NestJS CQRS Base

---
name: dev-tasks
description: >
  Generar tareas de desarrollo (Tasks del tracker configurado) a partir de una User Story: recopilacion de contexto, analisis de impacto, division en tareas, planes de desarrollo ejecutables por un agente, estimacion agentica y creacion/vinculo de las Tasks. Trigger: Cuando el usuario quiere convertir una US en tareas listas para implementar.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Breaking down a user story into tracker tasks"
    - "Generating tasks with development plans from a US"
    - "Creating and linking tracker tasks to a user story"
    - "Building an executable development plan per task"
---

Usar esta skill para descomponer una User Story en Tasks con plan de desarrollo y estimacion.

## Contexto Compartido Requerido

Antes de empezar, leer:

- `../dev-common/SKILL.md`
- `../dev-common/config/dev-project-config.md`
- Contrato del tracker configurado: `../dev-common/references/tracker-contracts-ado.md` o `../dev-common/references/tracker-contracts-notion.md`

Referencias de esta skill:

- `references/task-breakdown-guidelines.md`: criterios generales de impacto, refactor y division.
- `references/fe-task-guidelines.md`: criterios especificos para tareas FE (cargar si hay tareas FE).
- `references/be-task-guidelines.md`: criterios especificos para tareas BE (cargar si hay tareas BE).
- `references/task-plan.example.md`: ejemplo de plan + estimacion (solo si el formato no esta claro).

Skill de estimacion (cargar para el Paso 3):

- `../dev-estimation/SKILL.md`: estimacion por semejanza contra el catalogo calibrado del proyecto.
  Reemplaza la estimacion por rounds y al `estimador` por horas de dev humano.

Regla del proyecto (cargar solo si se detecta un refactor candidato):

- Regla de refactor del repo (ej: `refactor-rules`): tecnica, precondiciones y forma de documentar el
  refactor. Se usa para construir el plan del refactor en esta skill, no para ejecutarlo.

El proceso tiene 4 pasos. Cada paso minimiza el texto innecesario.

## Paso 1 - Exploracion y entendimiento

Objetivo: armar el contexto, entender que hay que cambiar y analizar el impacto con evidencia en el codigo. Paso obligatorio: cierra con un checkpoint de entendimiento antes de dividir.

Acciones:

- Asumir el rol del repo: cargar la regla de rol/stack indicada en el config (define stack, arquitectura y convenciones). Es el primer paso del proceso; sin el rol correcto no continuar. Objetivo: entender la arquitectura real del repo para respetarla y **no deformarla**; las tareas deben encajar en los patrones existentes, no introducir patrones nuevos sin justificacion explicita.
- Leer la US: si el usuario da el numero, obtenerla con MCP (Project ID del config); si da el texto, trabajar con ese texto.
- Mapa de contexto (si la US viene por numero): leer la US con `expand: "all"` y sus **relaciones directas** (un solo nivel): la Feature padre y las US hermanas, y las Tasks ya existentes de esta US. Ver el contrato del tracker configurado (Relaciones entre Work Items). No expandir mas de un nivel. Resumir en 2-4 lineas el contexto (que resuelve la US, con que se relaciona, que tareas ya existen) antes de dividir.
- Leer solo las reglas estrictamente necesarias para entender arquitectura y convenciones, desde la `Ubicacion de reglas del proyecto` del config. No asumir una ruta fija.
- Leer los archivos que el usuario mencione y los necesarios para comprender el flujo. Estrategia: primero busquedas (grep / semantic search) para identificar archivos relevantes; abrir solo los confirmados. No abrir a ciegas.
- Disciplina de exploracion (evitar loops y consumo innecesario de contexto): explorar solo lo necesario para entender el cambio y su impacto. Abrir cada archivo una vez; no re-leer lo ya entendido. Respetar el limite de profundidad del analisis de impacto (consumidores directos, un nivel; ver `references/task-breakdown-guidelines.md`). Reconstruir solo los flujos necesarios, no mapear el repo completo. Detener la exploracion cuando ya se puede describir que cambia, donde y a quien impacta. Si tras una busqueda acotada la informacion no aparece, preguntar al usuario en vez de seguir iterando a ciegas.

Analisis de impacto y refactor preparatorio: seguir `references/task-breakdown-guidelines.md`.

Cierre del Paso 1 (obligatorio): presentar al usuario un brief de entendimiento y esperar su confirmacion antes de pasar al Paso 2. Este checkpoint valida la **comprension** del cambio (la division se valida en el Paso 2).

El brief incluye:

- Que resuelve la US y el flujo / arquitectura afectada.
- **Evidencia**: archivos y consumidores confirmados en codigo vs. supuestos a validar.
- Impacto clasificado: requiere cambio de codigo / requiere validacion manual.
- Dudas bloqueantes (si las hay) como preguntas: **especificacion** (alcance, criterios, comportamiento esperado), **arquitectura** (patrones, donde encaja sin deformar el diseno) o **implementacion / impacto** (contratos, consumidores, impacto no confirmado).

No avanzar al Paso 2 con supuestos sin confirmar ni con dudas bloqueantes abiertas.

## Paso 2 - Division de tareas (alto nivel)

Objetivo: proponer la division en tareas y validarla antes del detalle tecnico. Parte del entendimiento ya confirmado en el Paso 1.

Lineamientos: ver `references/task-breakdown-guidelines.md` (division general, impacto, refactors, estado valido), `references/fe-task-guidelines.md` si hay tareas FE y `references/be-task-guidelines.md` si hay tareas BE.

Output esperado: lista de tareas de alto nivel ordenada por secuencia de implementacion (secuencias FE y BE separadas), con la dependencia inmediata anterior de cada tarea o `Ninguna` si es independiente. Solo el inmediato, no toda la cadena.

Esperar validacion del usuario antes de continuar.

## Paso 3 - Definicion completa de tareas

Objetivo: construir el plan de desarrollo de cada tarea para ejecucion directa por un agente.

Antes de redactar, leer las reglas necesarias (desde la `Ubicacion de reglas del proyecto` del config) para apoyar el plan en arquitectura y convenciones. Para tareas de refactor, construir el plan siguiendo la regla de refactor del repo (tecnica, precondicion de tests de caracterizacion, pasos pequenos verificables).

Por cada tarea definir:

- Titulo
- Estimacion (segun `../dev-estimation/SKILL.md`)
- Activity (`Dev BE`, `Dev FE` o `Dev`)
- Dependencia: tarea inmediatamente anterior. `Ninguna` si es independiente.
- Plan de desarrollo

Estructura del plan de desarrollo:

1. **Archivos clave a analizar**: solo los relevantes para contexto e impacto, con su razon. Incluir consumidores si afecta comportamiento existente.
2. **Reglas de arquitectura aplicables**: listar las reglas del proyecto que el ejecutor debe cargar. Las reglas base de desarrollo (function-development, etc.) siempre aplican; no hace falta listarlas.
3. **Cambios a realizar (paso a paso)**: instrucciones imperativas (que archivo, que logica, resultado esperado). Solo acciones sobre codigo, sin validacion ni testing.
4. **Flujos a validar por el desarrollador**: smoke test de estabilidad (happy path + regresion de consumidores directos). Checklist 2-4 items. Omitir si no hay flujo de usuario.
5. **Estimacion**: desglose completo segun `../dev-estimation/SKILL.md` (arquetipo + riesgo infra + redondeo). Forma parte de la Description en ADO.

Ajuste manual de estimacion (obligatorio si el usuario modifica el numero): registrar estimacion original del agente, estimacion corregida y motivo (`Regresion` / `Codificacion agentica` / `Otro`). Los valores cargados en `RemainingWork` y `OriginalEstimate` son la estimacion corregida si existe. Incluir el bloque dentro de la Description.

Esperar validacion del usuario antes de continuar.

## Paso 4 - Creacion de tareas en Azure DevOps

Seguir el contrato del tracker configurado:

- Crear cada Task con `create_work_item` (Title, Description en HTML, Activity, RemainingWork, OriginalEstimate).
- Vincular todas a la US con `create_work_item (parentId) / get_parent / get_children`, `type: "parent"`, en una sola llamada.
- Crear las relaciones de dependencia entre tareas: por cada tarea con dependencia inmediata anterior (definida en Paso 2/3), agregar un link `predecessor` desde la tarea sucesora hacia la predecesora (`id: sucesora, linkToId: predecesora, type: "predecessor"`). Solo la dependencia inmediata, no toda la cadena. Ver "Relaciones entre Work Items" en los contratos.

`Dev BE`: solo backend. `Dev FE`: solo frontend. `Dev`: ambas capas o no especifica.

Output esperado: confirmacion breve con IDs de las tareas creadas, su vinculo a la US y las dependencias `predecessor`/`successor` creadas.

## Paso 5 - Adjuntos FE (condicional)

Solo si alguna tarea creada es `Dev FE`:

1. Preguntar si el usuario tiene screenshots, mockups o referencias visuales para adjuntar.
2. Si tiene, pedir la ruta local de cada archivo y el ID de la tarea correspondiente.
3. Adjuntar segun la seccion `Adjuntos (Attachments)` del contrato del tracker configurado.
4. Confirmar cada adjunto con la URL devuelta.

Si no hay tareas FE, omitir este paso.

## Paso 6 - Ajuste de references (opcional)

Objetivo: capturar directivas permanentes que surgieron en la conversacion, para no repetir el mismo error en la proxima US. No es obligatorio y no se edita nada sin aprobacion explicita del usuario.

Disparar SOLO si durante el flujo el usuario dio una correccion que representa una preferencia **permanente y de alto impacto** que contradice o no esta reflejada en un archivo de `references/`. Ejemplo: el usuario pide no dividir FE en maquetado + integracion, lo que contradice `references/fe-task-guidelines.md`.

NO disparar por ajustes puntuales de esta US, detalles cosmeticos, ni preferencias de una sola vez.

Si aplica:

1. Identificar el archivo de `references/` y la regla concreta afectada.
2. Proponer al usuario el cambio especifico (que linea, como quedaria) y por que.
3. Editar solo si el usuario lo aprueba explicitamente.

Ante la duda de si la directiva es permanente, no proponer el cambio (a lo sumo mencionarlo). Evitar el bloat de reglas: mejor no cambiar que sobre-especificar.
