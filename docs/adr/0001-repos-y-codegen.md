# ADR-0001: Tres repos y un solo contrato OpenAPI

## Status

Accepted

## Context

Las plantillas y el tooling (skills, husky, naming, CI) funcionan por repo. Un monorepo obligaría a rehacer ese harness. La PWA instalada puede seguir corriendo un bundle viejo, así que el contrato tiene que versionarse desde el primer día.

## Decision

Tres repositorios git bajo la carpeta `mini-trainer/`: `mini-trainer-be`, `mini-trainer-fe` y `mini-trainer-app`. El backend es el único dueño de `docs/`, `openapi.json` y `mcp-servers/`. El prefijo es `/api/v1`. Los fronts generan tipos con `openapi-typescript`. El CI del backend falla si `openapi.json` commiteado difiere del generado.

## Consequences

### Positive

- Cada repo conserva el harness de la plantilla.
- Un bundle viejo de la PWA habla con una versión explícita.

### Negative

- Hay que mantener tres CI y tres conjuntos de dependencias.
- El contrato se desincroniza si alguien edita tipos a mano. Por eso el origen es el OpenAPI generado.
