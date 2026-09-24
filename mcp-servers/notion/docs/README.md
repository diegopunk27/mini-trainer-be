# MCP de Notion

Mismas 16 tools que `mcp-servers/azure-devops`: las 13 canónicas más `update_work_item`, `append_execution_note` y `export_sprint`.

El id acepta `123` o `MT-123` (`NOTION_ID_PREFIX`).

```bash
cd mcp-servers
yarn install
node notion/src/server.js
node --test notion/test/notion.test.js
```

Variables: `NOTION_TOKEN`, `NOTION_WORK_ITEMS_DS`, `NOTION_SPRINTS_DS`, `NOTION_HISTORY_DS`, `NOTION_BOARD_URL`, `NOTION_ME_EMAIL`, `NOTION_ID_PREFIX`.

El cliente usa `@notionhq/client` 5.x con la versión de API `2025-09-03` y data sources. El SDK de MCP sigue en 0.4, igual que los otros servers de la plantilla. La compatibilidad con el SDK 1.x queda para el spike de la Fase 0e.

`get_work_item_updates` no inventa historial: devuelve la base Historial más `created_time` / `last_edited_time` de la página.
