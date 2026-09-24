# Multi-tenancy

---
name: multi-tenancy
description: >
  Aislar datos por organizacion. El tenant sale solo del claim org del JWT. Trigger: Al crear tablas, repositorios, queries, jobs o cache de Mini-Trainer.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Adding a tenant table or repository"
    - "Writing a query that reads tenant data"
    - "Reviewing tenant isolation"
---

## Reglas

1. El `organizationId` sale de `requireOrganizationId()`. Nunca de un header, del body ni de la ruta.
2. Las tablas del tenant extienden la entidad de tenant. El repositorio completa `organization_id`, `created_by` y `updated_by`. No uses un subscriber de TypeORM.
3. Todo `find` filtra por organizacion. `createQueryBuilder` ya trae el filtro. No llames `.where()` otra vez: pisa el tenant. Usa `andWhere` o `Brackets`.
4. `update` y `delete` filtran por id y `organization_id`.
5. SQL crudo lleva `organization_id = $n`.
6. Catalogos compartidos leen `organization_id = :org OR organization_id IS NULL` y solo escriben filas propias.
7. Las foreign keys compuestas `(organization_id, id)` se definen en las migraciones SQL.
8. Cache `org:{id}:*`, storage `org/{id}/...`, jobs con `organizationId` y logs con organizacion y `requestId`.
9. Si el cliente no es accesible para ese miembro, responde 404, no 403.

## Referencia

[ADR-0002](../../docs/adr/0002-tenancy.md) y el meta-test de aislamiento de la fase 0e.
