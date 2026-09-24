# Contratos Azure DevOps MCP - Desarrollo

Este archivo concentra contratos operativos compartidos por los flujos de desarrollo cuando
`Tracker: ado`. Si el MCP cambia, actualizar este archivo antes de tocar los procedimientos.

Las skills deben **leer el contrato del tracker configurado**
(`tracker-contracts-ado.md` o `tracker-contracts-notion.md`). Los nombres de tools y las
formas de respuesta son los mismos en ambos trackers; solo cambia el mapeo interno.

El server local (`mcp-servers/azure-devops`) **no** expone las tools oficiales `wit_*` /
`repo_*`. Usar solo las tools listadas aqui.

## Configuracion

- El server lee `AZURE_ORG`, `AZURE_PROJECT` y `AZURE_PAT` desde `.cursor/mcp.json` (no commitear).
- Si `dev-common/config/dev-project-config.md` tiene placeholders `<COMPLETAR_...>`, detener
  el flujo y pedir ejecutar el prompt de setup.
- El parametro `project` de las tools oficiales no aplica: este server ya esta scoped al proyecto
  de las variables de entorno.

## Tools canonicas (13)

| Necesidad | Tool | Notas |
|---|---|---|
| Leer US / Task / Bug | `get_work_item` | Incluye Description, Acceptance Criteria y Discussion por defecto. Pedir `includePlainText: true` para prompts. |
| Padre (US de una Task/Bug) | `get_parent` | Incluye Description y AC del padre. |
| Hijos (Tasks de una US) | `get_children` | Filtrar con `types: ["Task"]` si aplica. |
| Buscar por titulo | `search_work_items` | Keyword en Title. |
| URL del board | `get_board_url` | Sprint actual. |
| Descargar un adjunto | `get_attachment` | URL completa o `attachmentId`. |
| Imagenes embebidas | `get_work_item_images` | Extrae `<img>` de Description/AC. |
| Listar adjuntos | `get_work_item_attachments` | Relations `AttachedFile`; descarga y extrae texto de xlsx/csv/txt/pdf. |
| Listar Tasks | `list_tasks` | Filtros `state`, `assignedTo` (`@Me`), `titleContains`. |
| Crear Task / Bug | `create_work_item` | Requiere PAT con Work Items Read & Write. |
| Agregar tags | `add_work_item_tags` | Merge sobre `System.Tags`; no borra los existentes. |
| Comentar Discussion | `add_work_item_comment` | Publica en Discussion. Texto plano se convierte a HTML. |
| Historial | `get_work_item_updates` | Pestaña History (API Updates): autor, fecha, `oldValue`/`newValue`. |

Campos frecuentes que devuelve `get_work_item`:

- `System.Id`, `System.Title`, `System.Description`, `System.State`
- `Microsoft.VSTS.Common.AcceptanceCriteria`
- `Microsoft.VSTS.Common.Activity`
- `Microsoft.VSTS.Scheduling.RemainingWork`
- Discussion (comentarios)

Relaciones:

- US -> Tasks: `get_children` sobre la US.
- Task/Bug -> US: `get_parent`.
- No hay tool de linking generico (`wit_work_items_link` no existe). El vinculo jerarquico se
  crea al alta con `create_work_item.parentId`.

## Lectura de Bugs

`get_work_item` sobre el Bug. Campos utiles: Title, ReproSteps, Acceptance Criteria, SystemInfo,
AssignedTo. US padre: `get_parent`. Tasks de la US: `get_children` sobre el padre.

## Creacion de Tasks

Tool: `create_work_item` (requiere PAT con Work Items Read & Write).

| Campo | Parametro | Valores |
|---|---|---|
| Titulo | `title` | Nombre de la tarea |
| Tipo | `type` | `Task` (default) / `Bug` |
| Descripcion | `description` | HTML valido (`<p>`, `<ul>`, `<li>`, `<strong>`) |
| Activity | `activity` | `Dev BE` / `Dev FE` / `Dev` |
| Estimacion | `remainingWork` | Horas (decimal con `.`) |
| Padre | `parentId` | ID de la US (jerarquia parent/child) |

Errores a evitar:

- Omitir `activity` falla con `TF401320` en procesos que lo requieren.
- `remainingWork` acepta decimales con `.`: `1.5`, `2.5`.
- No usar `#[numero]` en titulos ni comentarios (asociaciones automaticas no deseadas).

## Extensiones (3)

Estas tools no estan en la copia canonica de 13 tools (`~/.cursor/mcp-servers/azure-devops`).
El MCP de esta plantilla (`mcp-servers/azure-devops`) ya las implementa.

| Tool | Uso | Contrato |
|---|---|---|
| `update_work_item` | Parte B de plan-execution | Actualiza propiedades y/o **reemplaza una seccion** de Description (plan). No reescribe el resto. |
| `append_execution_note` | Parte C de plan-execution | Agrega una nota de ejecucion **sin reescribir** las anteriores. Changelog append-only. |
| `export_sprint` | Sprint review | Exporta el sprint a CSV (mismas columnas que acepta `dev-sprint-review`). |

### `update_work_item`

Parametros tipicos: `id`, mas el campo o seccion a cambiar (`title`, `description`, `state`,
`remainingWork`, `activity`, o un identificador de seccion del plan). Reemplazar una seccion
del plan no debe pisar `Notas de ejecucion` ni otras secciones no mencionadas.

### `append_execution_note`

Parametros tipicos: `id`, `text` (o `note`). Agrega una entrada al changelog de
`Notas de ejecucion` sin tocar el resto de la Description ni las notas previas.

### `export_sprint`

Sin argumentos o con un id de sprint/iteration. Devuelve CSV (o ruta al CSV) con una fila
por tarea. Columnas alineadas con `dev-sprint-review`: ID, Title, Description, Assigned To,
State, Remaining Work, Original Estimate, Completed Work, Tags.

## Pull Requests

Los PR **no** se crean con este MCP. Usar la skill `pr` (`gh`) contra GitHub.

## Escritura - Reglas generales

1. Propuesta en chat.
2. Confirmacion explicita del usuario.
3. Escritura MCP (`create_work_item`, `update_work_item`, `append_execution_note`, tags, comentarios).
4. Resumen con IDs y titulos.

No modificar estado, asignado, iteration, area ni relaciones si no fueron parte de la confirmacion.

## Adjuntos

`get_attachment` / `get_work_item_images` / `get_work_item_attachments` cubren **lectura**.
El MCP no sube binarios. Para adjuntar una imagen a un work item, si existe el script:

```bash
ADO_PAT=<token> node skills/dev-common/scripts/dev-utils.mjs upload-attachment \
  --config skills/dev-common/config/dev-project-config.md \
  --work-item <id> \
  --file <ruta-imagen>
```
