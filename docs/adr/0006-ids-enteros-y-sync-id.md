# ADR-0006: Ids enteros y sync_id

## Status

Accepted

## Context

La plantilla usa ids `serial`. La PWA crea registros sin conexión y puede reenviar el mismo alta.

## Decision

Los ids siguen siendo enteros. Las filas que nacen offline llevan `sync_id uuid`, único por organización. El alta offline es un `PUT` idempotente por ese id.

## Consequences

### Positive

- El resto del stack de la plantilla no cambia.
- Reenviar el mismo entrenamiento no duplica series.

### Negative

- Hay dos identificadores. El de URL es el entero. El de sincronización es el uuid.
