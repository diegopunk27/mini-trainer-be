# Contratos Notion MCP - Desarrollo

Este archivo documenta el **mismo contrato de tools** que Azure DevOps, mapeado a Notion.
El server de la plantilla es `mcp-servers/notion` y expone las mismas tools. El smoke contra un workspace real queda para cuando exista el token. Las skills leen
`config/dev-project-config.md` (`Tracker: notion`) y luego **este** contrato.

Los nombres de tools y las formas de respuesta coinciden con
`tracker-contracts-ado.md`. Los procedimientos de las skills `dev-*` no cambian.

## Configuracion

Leer de `dev-common/config/dev-project-config.md`:

- **ID prefix** (ej. `MT`): IDs publicos tipo `MT-123`.
- **Notion data source ids**: US, Task, Bug (placeholders hasta completar el setup).
- **Board URL**: URL del board de Notion.

Si hay placeholders `<COMPLETAR_...>`, detener el flujo y pedir el setup.

## Mapeo practico Notion

| Concepto ADO | Notion |
|---|---|
| Work item ID numerico (`88140`) | ID con prefijo configurado (`MT-123`). Las tools aceptan el ID publico. |
| `System.State` | `New` / `Active` / `Resolved` / `Closed` / `Removed` (mismos valores). |
| `Microsoft.VSTS.Common.Activity` | `Dev BE` / `Dev FE` / `Dev`. |
| Description HTML | Rich text / bloques Notion. El MCP normaliza a HTML o texto plano segun `includePlainText`. |
| Discussion | Comentarios de la pagina. |
| History (`get_work_item_updates`) | **Limitacion**: Notion no tiene History equivalente a ADO Updates. La tool puede devolver un array vacio o un subconjunto (ultimas ediciones conocidas). No inventar historial. |
| Parent / children | Relacion Notion (US ↔ Tasks). `parentId` al crear. |
| Tags | Multi-select o equivalente. `add_work_item_tags` hace merge. |
| Sprint / board | Data source + Board URL del config. |

## Tools canonicas (13) — mismos nombres

| Tool | Respuesta (misma forma que ADO) | Nota Notion |
|---|---|---|
| `get_work_item` | Title, Description, AC, State, Activity, RemainingWork, Discussion | Resolver por ID `MT-123` en el data source correspondiente. |
| `get_parent` | Padre (US o Bug) con Description y AC | Relacion parent. |
| `get_children` | Hijos; `types: ["Task"]` si aplica | Relacion children. |
| `search_work_items` | Lista por keyword en Title | Query sobre los data sources. |
| `get_board_url` | URL del board | Del config (`Notion Board URL`). |
| `get_attachment` | Binario / texto extraido | Archivos de la pagina. |
| `get_work_item_images` | Imagenes embebidas | Bloques image + `<img>`. |
| `get_work_item_attachments` | Lista de adjuntos | Archivos de la pagina. |
| `list_tasks` | Tasks filtradas | Data source de Tasks. |
| `create_work_item` | Work item creado + `parentId` | Crea en el data source segun `type`. |
| `add_work_item_tags` | Tags mergeados | No reemplazar el multi-select entero. |
| `add_work_item_comment` | Comentario publicado | Comentario de pagina. |
| `get_work_item_updates` | Historial `{ author, date, field, oldValue, newValue }` | Puede ser vacio o parcial. No fallar el flujo: informar la limitacion. |

## Extensiones (3) — mismos nombres

| Tool | Uso | Contrato (identico a ADO) |
|---|---|---|
| `update_work_item` | Actualizar propiedades y/o reemplazar **una** seccion del plan | No reescribir el resto de la Description. |
| `append_execution_note` | Agregar nota de ejecucion | Append-only; no reescribir notas previas. |
| `export_sprint` | CSV del sprint | Mismas columnas que `dev-sprint-review`. |

## Escritura

Misma regla que ADO: propuesta → confirmacion explicita → escritura MCP → resumen con IDs
(`MT-123`) y titulos. No cambiar estado, asignado ni relaciones sin aprobacion.

## Pull Requests

Los PR no se crean con este MCP. Usar la skill `pr` (`gh`) contra GitHub. En "Tareas
relacionadas" se puede poner el ID (`#MT-123`) o el link de la pagina Notion.
