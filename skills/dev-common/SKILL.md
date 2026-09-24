# Dev Common - NestJS CQRS Base

---
name: dev-common
description: >
  Recursos compartidos de desarrollo agentico con tracker configurable (Azure DevOps o Notion): configuracion multi-repo, contratos MCP de work items, lectura de US/Task, reglas de seguridad para escritura y el rol/stack por repositorio. Trigger: Base compartida de los flujos dev-* (estimacion, ejecucion de planes, sprint review). Cargar antes de cualquier operacion sobre el tracker.
license: MIT
metadata:
  author: template-team
  version: "2.0.0"
  scope: [root]
  auto_invoke:
    - "Reading tracker work items"
    - "Loading project config for tracker flows"
    - "Resolving tracker project or repository IDs"
    - "Writing to the tracker via MCP"
---

Usar esta skill como base compartida de todos los flujos de desarrollo agentico sobre el tracker
configurado (`ado` o `notion`).

## Archivos Requeridos

- `config/dev-project-config.md`: tracker, prefijo de IDs, datos ADO/Notion y repositorios.
- `config/stack-role.template.md`: template del rol experto por repositorio que genera el setup.
- `references/tracker-contracts-ado.md`: contrato MCP cuando `Tracker: ado`.
- `references/tracker-contracts-notion.md`: mismo contrato de tools mapeado a Notion.
- `scripts/dev-utils.mjs`: utilidades deterministas (validacion de config).

Si falta un archivo, pedir al usuario copiar nuevamente la carpeta completa `skills/dev-common`.

## Configuracion del Proyecto

Leer `config/dev-project-config.md` antes de cualquier operacion de tracker o git.

1. Leer **Tracker** (`ado` | `notion`) e **ID prefix**.
2. **Leer el contrato del tracker configurado** (`tracker-contracts-ado.md` o
   `tracker-contracts-notion.md`). Los nombres de tools coinciden; los procedimientos no cambian.
3. Detener el flujo si algun campo requerido del tracker activo contiene `<COMPLETAR_...>`.
   Pedir al usuario completar la configuracion antes de continuar.

Cuando un flujo opere sobre un repositorio, resolver el hosting y la `Base branch` del repo
correspondiente en la seccion `Repositorios` del config.

## Rol y Stack por Repositorio

Cada repositorio tiene una regla de rol generada en el setup (a partir de `config/stack-role.template.md`)
que define el stack, lineamientos y las validaciones a correr por iteracion.

Los flujos que ejecutan o revisan codigo deben respetar el rol del repo:

- `dev-plan-execution` usa las "Validaciones por iteracion" y el "Testing de cierre" del rol.
- `dev-code-review` usa el rol/stack y los lineamientos para revisar el codigo (cumplimiento de reglas y decisiones de stack).

## Lectura de Work Items

Para leer una US, Task o cualquier work item:

- Herramienta: `get_work_item`.
- Parametros: `id` (numerico ADO o `PREFIX-123` Notion). Pedir `includePlainText: true` si el texto va a un prompt.
- Campos frecuentes: Title, Description, Acceptance Criteria, relaciones (parent).

Detalle en el contrato del tracker configurado.

## Seguridad del tracker

Separar siempre:

1. Leer datos actuales del tracker.
2. Proponer cambios en el chat.
3. Esperar confirmacion explicita del usuario.
4. Escribir en el tracker.
5. Devolver IDs, titulos y vinculos/relaciones modificadas.

No modificar estado, asignado, iteration, area, relaciones ni campos custom si el usuario no aprobo ese campo.

## Scripts Auxiliares

Validar configuracion:

```bash
node skills/dev-common/scripts/dev-utils.mjs validate-config --config skills/dev-common/config/dev-project-config.md
```
