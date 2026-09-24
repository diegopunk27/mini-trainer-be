# ADR-0004: Ocurrencias materializadas

## Status

Accepted

## Context

Reservas, lista de espera y locks necesitan una fila real. Calcular la recurrencia en cada request no permite un cupo ni un doble turno a nivel de base.

## Decision

Un expansor puro, testeado, materializa la serie en su zona horaria sobre un horizonte móvil de 16 semanas. Un job nocturno extiende el horizonte. Los turnos 1:1 se calculan como slots y se materializan al reservar. El doble turno lo impide un índice de exclusión sobre el rango horario.

## Consequences

### Positive

- El cupo y el solapamiento se defienden en Postgres, no solo en el handler.
- El cambio de horario de verano se resuelve al expandir en la zona de la serie.

### Negative

- Hay que regenerar sin perder excepciones ni reservas ya tomadas.
