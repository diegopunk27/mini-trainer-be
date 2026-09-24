# ADR-0002: Tenant solo desde el JWT

## Status

Accepted

## Context

Un header, un campo del body o un id en la ruta se pueden falsificar. El producto guarda salud, PAR-Q y fotos. Una fuga entre organizaciones es el fallo más grave.

## Decision

El tenant sale únicamente del claim `org` del JWT. El repositorio de tenant agrega `organization_id` a lecturas y escrituras. Las foreign keys compuestas `(organization_id, id)` impiden que una reserva apunte a un cliente de otra organización. RLS de Postgres no entra en el MVP: con el pool exige `SET LOCAL` por transacción. Se reevalúa antes de white-label.

## Consequences

### Positive

- Falla cerrado si el contexto está vacío.
- Un bug de handler no alcanza para cruzar tenants si la FK compuesta está bien.

### Negative

- Toda query nueva tiene que acordarse del filtro. Lo vigilan una regla de lint, la skill de multi-tenancy y un meta-test de rutas.
