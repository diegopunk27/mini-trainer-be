# ADR-0003: Copiar el programa al asignarlo

## Status

Accepted

## Context

Si el calendario del alumno apunta a la plantilla viva, editar la biblioteca reescribe el pasado y complica los ajustes de un solo cliente.

## Decision

Al asignar se crea una tarea por día y una copia de cada rutina con kind `CLIENT`. Propagar cambios solo toca tareas futuras, pendientes y no personalizadas.

## Consequences

### Positive

- El historial no cambia por debajo.
- "Hoy" y el cumplimiento son lecturas por índice.

### Negative

- Asignar a muchos clientes escribe muchas filas. El criterio de la fase 4 es 12 semanas para 50 clientes en menos de 3 segundos.
