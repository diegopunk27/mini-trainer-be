# Dev Sprint Review - NestJS CQRS Base

---
name: dev-sprint-review
description: >
  Analizar metricas de un sprint a partir de export_sprint o un CSV/Excel. Genera un informe conciso para guiar la retrospectiva y, por separado, delega la calibracion tecnica de la estimacion agentica. Trigger: Cuando el usuario quiere revisar eficacia de estimacion, desvios y cierre de un sprint.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Analyzing sprint metrics from a tracker CSV export"
    - "Reviewing estimation accuracy at sprint close"
    - "Calibrating estimation archetypes from sprint data"
    - "Running a sprint retrospective report"
---

Analista de delivery. Informe **conciso y accionable** en espanol para guiar una **retrospectiva**.
Priorizar claridad: numeros clave, tablas cortas, conclusiones directas.

La calibracion del estimador **no vive aca**: esta skill prepara el lote de tareas del CSV y **delega**
a `../dev-estimation/` (ver `references/sprint-review-analysis.md`), que posee el catalogo de
arquetipos y el procedimiento de calibracion.

## Contexto Compartido Requerido

- `../dev-common/SKILL.md`
- `../dev-estimation/references/archetype-catalog.md`
- `../dev-estimation/references/calibration.md` (procedimiento de calibracion, solo para el anexo)
- `../dev-estimation/references/calibration-log.md`
- `../dev-plan-execution/references/execution-notes-guidelines.md` (tipos de comentario de la regla 10)

## Entrada

Aceptar **una** de estas fuentes (misma forma tabular):

1. Tool `export_sprint` del MCP del tracker configurado (leer el contrato).
2. Un CSV/Excel que el usuario adjunte.

### CSV / Excel (o salida de `export_sprint`)

Una fila por tarea. Columnas esperadas (mapear nombres similares):

| Columna | Notas |
|---------|-------|
| **ID** | Identificador del work item |
| **Title** | Puede contener tags entre corchetes |
| **Description** (recomendado) | Plan de desarrollo + estimacion + bloque de ajuste manual (`Δ ajuste`) + seccion `Notas de ejecucion` (changelog de comentarios sobre la tarea, si los hubo). Fuente principal para clasificar por arquetipo y para detectar patrones de ejecucion; si falta, ambos pierden precision |
| **Assigned To** | Obligatorio para la cohorte. Vacio = excluida |
| **State** | Normalizar sin distinguir mayusculas |
| **Remaining Work** | Horas pendientes. Vacio = 0. Mide desvio |
| **Original Estimate** | Obligatoria > 0 para la cohorte |
| **Completed Work** | Horas ejecutadas (total). Ground truth vs Base |
| **Agent Completed Work** (opcional) | Split diagnostico. No obligatorio para calibrar |
| **Regression Completed Work** (opcional) | Split diagnostico. No obligatorio para calibrar |
| **Tags** (opcional) | Clasificar fuera de planning / correccion PR y relevar el resto de los tags presentes en la cohorte |

La calibracion por semejanza usa **Completed Work vs Base agentica**, clasificando con la **Description**.
`Agent` / `Regression` son opcionales.

### Informes historicos (opcional)

El usuario puede adjuntar los ultimos 2-3 informes de sprint review previos para: detectar tendencias de
estimacion, seguir calibraciones anteriores y ampliar muestra. Extraer solo metricas clave de cada informe
previo; no re-analizar su CSV.

## Cohorte analizable

Analizable = **Assigned To** no vacio + **Original Estimate** numerico > 0. El resto va a Inconsistencias
y se excluye de metricas. Si ninguna fila es valida, mostrar solo inconsistencias.

## Reglas de analisis (sobre la cohorte)

1. **Tareas no cerradas**: cerrada = `Closed`/`Done`/`Resolved`. No cerradas -> clasificar en Pendiente PR/deploy o No terminadas.
2. **Fuera de planning**: filtrar por titulo/tags (`fuera de planning`, `OOP`, `unplanned`, `hotfix`).
3. **Horas refactor / correccion PR**: sumar Completed Work de titulos/tags `Correccion PR`, `fix PR`, `refactor`, `code review fixes`. Declarar cadenas usadas.
4. **Otros tags de la cohorte**: catalogar todos los tags presentes que no entren en las reglas 2-3. Agrupar por tag y ver si concentra una porcion notable de tareas u horas, o coincide con desvios (regla 6/8). Reportar solo los que muestren un patron con valor para el equipo (ej: 3+ tareas con el mismo tag y desvio consistente); el resto se omite (no listar tags sueltos sin senal clara).
5. **Desvio**: tareas no cerradas con `Remaining Work > 0`: listar y sumar.
6. **Eficacia de estimacion** (solo cerradas): varianza = `Completed - Original`. Total Original vs Completed, % con demora, mediana de `Completed/Original`. Si hay split, agregar columnas Agent y Regression.
7. **Clasificacion de tareas (arquetipos)**: para las tareas cerradas con Description disponible, clasificar por arquetipo siguiendo el Paso 1 de `../dev-estimation/references/calibration.md` (clasificar + comparar real vs Base), sin proponer cambios de catalogo aca (eso es el anexo). Reportar en el informe solo si algun arquetipo concentra el mayor desvio del sprint (n>=2 en el lote); si la muestra es muy chica o no hay senal clara, omitir la seccion.
8. **Eficacia por desarrollador**: por Assigned To, cerradas/no cerradas, sumatorias y % demora. Tono descriptivo, no punitivo.
9. **Completitud**: verificar si la tarea tiene plan de desarrollo y desglose de estimacion en Description. Si el CSV no incluye Description: "No verificable desde CSV."
10. **Patrones de ejecucion (Description)**: en las tareas cerradas con Description, leer mas alla del plan. Fuentes a revisar:
    - El bloque `Δ ajuste` (motivo `Regresion` / `Codificacion agentica` / `Otro` + texto).
    - Desvios que `../dev-plan-execution/SKILL.md` integra en la Description (Fase 6 Parte B: desvios relevantes que cambiaron el plan).
    - La seccion `Notas de ejecucion` (changelog de `dev-plan-execution` Fase 6 Parte C, ver tipos de comentario en `../dev-plan-execution/references/execution-notes-guidelines.md`): comentarios sobre la tarea que no cambiaron el plan pero se registraron igual — bloqueantes, dudas resueltas, discrepancias por informacion faltante, decisiones tomadas sobre la marcha, deuda tecnica notada, etc. No es una lista cerrada.
    - Cualquier otra mencion textual equivalente que haya quedado en el texto sin seguir el formato de changelog (buscar variantes como "spec incompleta", "falto definir", "se pregunto al usuario", "discrepancia con la US/CA", "dato no disponible").

    Agrupar por tema o motivo repetido (>=2 tareas) y reportar solo si el patron aporta una senal accionable para el equipo. No forzar la seccion ni listar casos aislados.

    **Prioridad especial: especificacion incompleta.** Si el patron repetido es que varias tareas partieron de una US/CA incompleta o requirieron aclaraciones antes de poder ejecutarse, no es un detalle menor de ejecucion: es un hallazgo de **proceso de refinamiento** y debe destacarse explicitamente en Conclusiones (seccion 13), no solo mencionarse aca.

    **Limitacion:** este analisis solo detecta lo que quedo escrito en la Description. Si el CSV no trae Description, o el bloqueante/duda se resolvio sin que el desarrollador aceptara agregar la nota de ejecucion, el patron no es detectable desde el CSV — indicarlo si la seccion queda vacia por falta de datos, distinto de "no hay patron".

## Formato del informe

Cada seccion ocupa el minimo necesario. Tablas cortas y bullets.

1. **Resumen ejecutivo** - 3-4 lineas (total tareas, analizables, excluidas).
2. **Inconsistencias** - tabla (ID, Title, Motivo) o una linea.
3. **No cerradas** - total + subtotales.
4. **Fuera de planning** - cantidad y % sobre analizables.
5. **Refactor / correccion PR** - total Completed Work.
6. **Otros tags relevantes** (condicional, regla 4) - solo si algun tag mostro patron. Omitir la seccion si no hay hallazgos.
7. **Desvio** - total Remaining Work en no cerradas.
8. **Estimaciones vs realidad** - tabla cerradas (ID, Title, Original, Completed, Varianza). Mediana + CV del ratio. Si CV > 0.5: reportar como hallazgo de estimaciones inconsistentes.
9. **Clasificacion de tareas** (condicional, regla 7) - arquetipo(s) con mayor desvio del sprint, en lenguaje de equipo (no la mecanica de calibracion). Omitir si no hay senal clara o Description no disponible.
10. **Por desarrollador** - tabla.
11. **Completitud** - conteos.
12. **Patrones de ejecucion** (condicional, regla 10) - temas repetidos detectados en las Description (motivos de ajuste, desvios, bloqueantes/dudas/spec incompleta). Omitir si no hay patron con valor.
13. **Conclusiones** - 3-5 bullets con una accion concreta para el proximo sprint. Si la regla 10 detecto un patron de especificacion incompleta repetido, incluirlo aca como hallazgo propio (ej: "revisar refinamiento de US antes de sprint planning"), no solo dejarlo en la seccion 12.

Si una seccion da cero o no aplica: una linea y seguir. Las secciones marcadas "condicional" se omiten directamente (sin mencionarlas) cuando no hay hallazgo — no agregar ruido al informe.

## Anexo tecnico de calibracion

**No forma parte del informe.** Bloque separado, despues del informe. Calibra el estimador
`../dev-estimation/` a partir del CSV del sprint (no por tarea cerrada individual):

1. Formatear las tareas cerradas del CSV segun el contrato de `references/sprint-review-analysis.md`.
2. Delegar a `../dev-estimation/` en modo calibracion (`references/calibration.md` de esa skill),
   pasando el lote. Reutilizar la clasificacion por arquetipo ya hecha para la regla 7 (no re-clasificar
   dos veces).
3. No editar `archetype-catalog.md`, `calibration-log.md` ni el `SKILL.md` de estimation fuera de ese
   flujo; la aprobacion del usuario la pide `dev-estimation` antes de aplicar.

Flujo obligatorio: **proponer -> el usuario aprueba/sugiere -> aplicar**. Nunca editar esos archivos sin
aprobacion explicita.
