# ADR-0005: Jobs con pg-boss

## Status

Accepted

## Context

Los recordatorios, el vencimiento de bonos y la materialización de series tienen que encolarse dentro de la misma transacción que la reserva. Un cron en cada instancia se duplica. Una cola en Redis no puede unirse a la transacción de Postgres.

## Decision

`pg-boss` corre en el Postgres que ya tenemos, detrás de un puerto. Se encola en la misma transacción. Trae diferidos, cron, reintentos y `SKIP LOCKED`. "Ahora" se inyecta con un puerto de reloj para los tests.

## Consequences

### Positive

- No hace falta Redis para el MVP.
- Un recordatorio no se encola si la reserva hace rollback.

### Negative

- Los jobs comparten la base de la aplicación. Hay que vigilar el volumen del horizonte de 16 semanas.
