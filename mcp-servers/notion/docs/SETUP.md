# Setup de Notion

1. Crear una integración interna con acceso a leer, actualizar e insertar contenido, leer e insertar comentarios, y leer usuarios con email.
2. Crear una página "Mini-Trainer" y compartirla solo con esa integración.
3. Exportar `NOTION_TOKEN` y `NOTION_PARENT_PAGE_ID`.
4. Correr `node mcp-servers/notion/scripts/setup.cjs`.

El script crea las bases Work Items, Sprints e Historial bajo la página padre e imprime los data source ids.

Si la API rechaza la propiedad `ID` de tipo unique_id, crearla a mano en Work Items con prefijo `MT` y volver a correr el script: `validate` comprueba que exista.

Las vistas ("Sprint actual", "Backlog por fase", "Mis tareas") no las crea la API. Hacerlas en Notion y copiar la URL del board a `NOTION_BOARD_URL`.
