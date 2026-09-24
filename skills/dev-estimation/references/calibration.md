# Calibracion del catalogo (por sprint)

Procedimiento **de esta skill** (`dev-estimation`). Se invoca tipicamente desde `../../dev-sprint-review`,
que prepara el lote formateado desde el CSV y delega aca. No cargar este archivo al estimar; solo al calibrar.

Los **datos** (arquetipos, Base agentica, Ref. humana, N, Confianza) viven en `archetype-catalog.md`. El
**historico y log de sprints** vive en `calibration-log.md`. Este archivo es solo el **como** calibrarlos.

> Regla central: **siempre proponer primero** la calibracion; recien tras la **aprobacion explicita** del
> usuario se editan archivos. Si el usuario sugiere cambios, incorporarlos y re-confirmar antes de aplicar.

## Que calibra (archivos objetivo)

- `archetype-catalog.md`: Base agentica por arquetipo, banda de riesgo infra, piso 0.5h, arquetipos nuevos.
- `calibration-log.md`: log historico por sprint (agregar las tareas del lote).
- `SKILL.md` (de esta skill): solo si cambia una **regla del metodo** (piso 0.5h, granularidad, buffer).

## Entrada (contrato)

Lista de tareas cerradas del sprint, ya formateadas por quien invoca (una entrada por tarea):

| Campo | Obligatorio | Notas |
|---|---|---|
| `capa` | si | `BE` / `FE` / `Review` (segun Activity o tipo) |
| `titulo` | si | Title (contexto; no es la fuente principal para clasificar) |
| `descripcion` | si* | Description del work item (plan de desarrollo + estimacion). *Si el CSV no la trae, pedirla o marcar la tarea como no clasificable con certeza |
| `real` | si | Completed Work (horas) |
| `estimado` | no | Original Estimate (para contexto) |
| `agent` | no | Agent Completed Work (opcional; split diagnostico) |
| `regression` | no | Regression Completed Work (opcional; split diagnostico) |

**Ground truth de calibracion = `real` (Completed Work) vs Base agentica** del catalogo. `agent` /
`regression` no son obligatorios: si vienen, diagnostico; si no, calibrar solo con `real`. Si vienen ambos,
quien invoca puede validar `Agent + Regression ~= Completed` (+-10%) y, si no cuadra, reportarlo y seguir
con `real`.

**Campos que se infieren aca (no vienen listos del lote):** ninguno obligatorio mas alla de asignar el
arquetipo (Paso 1). No se infiere `tipo_cambio` ni tags de riesgo en el modelo de este template (a diferencia
de otros proyectos, aca el riesgo es una banda infra/config puntual, ver `archetype-catalog.md`).

No appendear la lista completa de tareas del lote en ningun archivo; el crudo vive en el CSV de ADO /
`../../dev-sprint-review`.

## Paso 1 - Clasificar por arquetipo

Asignar cada tarea cerrada a un arquetipo del catalogo (BE, o "Correccion de bugs" si `capa` indica que es
una Task de fix) usando `capa` + `descripcion` (plan de desarrollo) + patron del `titulo` como contexto.

- Si una tarea no encaja en ningun arquetipo -> marcarla como **candidata a arquetipo nuevo** (agrupar
  candidatos parecidos; no crear un arquetipo por una sola tarea aislada).
- Si la clasificacion es ambigua o falta `descripcion` -> listar el supuesto para que el usuario lo
  confirme antes de calibrar.
- **Tareas de correccion de bugs** (`dev-bug-fix-tasks`): clasificar contra "Correccion de bugs"
  (Bug-clean / Bug-verify / Bug-explore) segun lo que documente el bloque de causa raiz en la
  `descripcion`, no contra `BE-fix`.

## Paso 2 - Comparar real vs Base agentica

Por arquetipo (usar `N` del catalogo + las tareas del lote; si el catalogo tiene `N = "-"`, contar como 0;
idealmente `N` total >= 3 para mover la Base):

- Mediana del `real` de las tareas de ese arquetipo en el lote (excluir outliers explicados por riesgo infra).
- Bucket de 0.5h en el que cae esa mediana vs la Base agentica actual del catalogo.
- Dispersion / outliers (si el desvio viene de riesgo infra/config, no mueve la Base: va a la banda de riesgo).

## Paso 3 - Senales de ajuste

| Senal | Evidencia | Ajuste propuesto |
|---|---|---|
| Base agentica desfasada | Mediana real de un arquetipo (`N` total >= 3) cae en un bucket distinto a su Base, consistente con el historico | Subir/bajar la Base en `archetype-catalog.md` |
| Arquetipo nuevo | Cluster (>=3) sin encaje y con real distinto, o el usuario confirma una candidata | Crear arquetipo con descripcion, Base y `N` |
| Piso 0.5h holgado | Mayoria de tareas base con real << 0.5h y el usuario quiere mas fidelidad | Bajar piso o granularidad 0.25h (cambia `SKILL.md`) |
| Piso 0.5h corto | Tareas base con real > 0.5h de forma repetida (sin riesgo infra) | Subir Base del arquetipo o el piso |
| Banda de riesgo infra mal calibrada | Tareas con riesgo infra cuyo real != +0.5h/+1.0h; o tareas sin infra que hacen blowup | Ajustar banda o sus triggers en `archetype-catalog.md` |
| Testing manual creciente | Mediana de `regression` deja de ser ~0 (>0.25h repetido) | Proponer banda de pruebas manuales en el metodo |

## Guardrails (cuando NO ajustar parametros)

- Arquetipo con `N` total < 3 (incluido el lote) -> solo actualizar `N` en el catalogo; **no** tocar la Base.
- Arquetipo con `N = "-"` (sin datos aun) y el lote trae tareas de ese arquetipo -> reemplazar `-` por el
  numero de tareas del lote (aunque sea `1` o `2`). Sigue sin tocar la Base hasta `N` total >= 3.
- Outliers de riesgo infra aislados -> no mover la Base del arquetipo (se explican por la banda de riesgo).
- No crear un arquetipo por una sola tarea aislada: hace falta un **cluster** o confirmacion explicita del usuario.
- Cambios de **regla del metodo** (piso, granularidad, buffer) solo con patron claro y aprobacion explicita.

No ajustar parametros no significa ignorar el dato: las tareas del lote **siempre** se agregan al
`calibration-log.md` (tambien con confirmacion).

## Paso 4 - Proponer y aplicar

Presentar SIEMPRE primero una propuesta detallada. Para cada ajuste:

```
> **Calibracion propuesta [N]:** [archivo + que cambia]
> - Por que: [arquetipo, N, mediana real del lote, Base actual, bucket]
> - Que se haria: [Base/N actual -> nuevo, o nuevo arquetipo con descripcion]
> - Impacto: [como cambiarian las estimaciones futuras]
> - Limitacion: [tamano de muestra N]
```

Incluir tambien el bloque de **filas a agregar al `calibration-log.md`** (siempre se agregan, con o sin
cambios de Base).

Luego **esperar aprobacion, rechazo o sugerencias del usuario**. Recien con aprobacion explicita, aplicar
los cambios en `archetype-catalog.md`, `calibration-log.md` y (si aplica) `SKILL.md`. Si el usuario sugiere
cambios, incorporarlos y re-confirmar antes de aplicar.

Si no se cumplen criterios de ajuste de Base: "Sin cambios de Base este sprint. Se actualiza `N` de N
arquetipos en el catalogo." (tambien requiere confirmacion antes de editar).
