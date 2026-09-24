# Anexo: handoff de calibracion hacia `dev-estimation`

No forma parte del informe de sprint review. Este anexo **no calibra**: prepara el lote y **delega** la
calibracion a `../../dev-estimation/` (que posee el catalogo de arquetipos y el procedimiento).

## Rol de esta skill

1. Leer el CSV del sprint. Ground truth = **Completed Work**. `Agent` / `Regression` son opcionales: si
   vienen ambos, validar `Agent + Regression ~= Completed` (+-10%) y reportar si no cuadra; si no vienen,
   omitirlos.
2. Formatear las tareas **cerradas** de la cohorte al contrato de entrada de la calibracion. Incluir
   **Description** cuando el CSV la traiga (es la fuente principal para clasificar).
3. Cargar `../../dev-estimation/SKILL.md` (modo calibracion) y
   `../../dev-estimation/references/calibration.md`, pasando el lote formateado.
4. No editar `archetype-catalog.md` ni el `SKILL.md` de estimation por fuera de ese flujo.

La clasificacion por arquetipo (Paso 1 de `calibration.md`) se hace **una sola vez** por sprint: alimenta
tanto la seccion "Clasificacion de tareas" del informe principal (regla 7 de `SKILL.md`, solo si hay
senal) como este anexo. No reclasificar el lote dos veces.

## Contrato de salida (lote hacia estimation)

Una entrada por tarea cerrada. Pasar campos crudos; **no** pre-inferir el arquetipo (lo hace estimation
desde la descripcion, Paso 1 de `calibration.md`):

| Campo | Obligatorio | Fuente tipica en el CSV |
|---|---|---|
| `capa` | si | Activity (`Dev BE` / `Dev FE`) o `Review` si es una tarea de revision de codigo |
| `titulo` | si | Title |
| `descripcion` | si* | Description (plan de desarrollo). *Si el CSV no la incluye, advertirlo; estimation pedira confirmacion o marcara baja certeza al clasificar |
| `real` | si | Completed Work |
| `estimado` | no | Original Estimate |
| `agent` | no | Agent Completed Work |
| `regression` | no | Regression Completed Work |

El detalle de clasificacion, senales de ajuste, guardrails y propuesta/aplicacion vive **solo** en
`../../dev-estimation/references/calibration.md`.
