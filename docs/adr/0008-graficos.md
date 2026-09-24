# ADR-0008: Gráficos con MUI X Charts

## Status

Accepted

## Context

El progreso necesita gráficos en el backoffice y en la PWA. Un segundo sistema de temas se desalinea del claro/oscuro.

## Decision

`@mui/x-charts` (MIT), con carga diferida, en los dos frontends. Toma el tema de MUI y los tokens claro/oscuro. No se instala otra librería de charts.

## Consequences

### Positive

- Un solo tema.
- La licencia es compatible con el resto del stack.

### Negative

- Los gráficos llegan en la fase 5, no antes. Hasta entonces no se agrega la dependencia.
