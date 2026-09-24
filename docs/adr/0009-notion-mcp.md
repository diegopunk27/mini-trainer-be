# ADR-0009: Notion con un MCP propio

## Status

Accepted

## Context

Azure DevOps es de la empresa. Mini-Trainer es personal. El MCP oficial de Notion expone páginas genéricas, y las skills de flujo necesitan work items con id, secciones, padre e hijos y texto plano.

## Decision

Un MCP propio en `mcp-servers/notion`, solo en el backend, con los mismos nombres, parámetros y respuestas que el MCP de Azure DevOps, más `update_work_item`, `append_execution_note` y `export_sprint`. Las skills leen el contrato del tracker configurado (`ado` o `notion`). Los proyectos de la empresa no se tocan.

## Consequences

### Positive

- Las skills no se bifurcan por tracker.
- El id `MT-123` entra igual en commits, ramas y Notion.

### Negative

- La API de Notion no tiene historial de página ni vistas. El historial lo escribe el MCP, y el board es una URL de configuración.
- Hay que respetar cerca de 3 requests por segundo y pedir de nuevo las URLs de archivos, que vencen en una hora.
