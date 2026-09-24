# Configuracion del proyecto - Desarrollo Agentico (nestjs_cqrs_base)

Este archivo es la configuracion central del desarrollo agentico para el proyecto actual. Lo leen las
skills `dev-*`. No incluir tokens, PATs ni credenciales (viven en la config del MCP).

> **Topologia de este proyecto**: el tracker se usa **solo para work items / boards** (US, Tasks,
> estimacion, sprint). El **codigo y los Pull Requests viven en GitHub** (`<COMPLETAR_GITHUB_ORG>/nestjs_cqrs_base`),
> gestionados con la skill `pr` (`gh`). Las skills `dev-*` operan sobre work items; no hay
> Repository ID de ADO.

## Tracker

- **Tracker**: `ado`
  Valores: `ado` | `notion`. Default del template: `ado` (checkouts estilo empresa siguen funcionando).
- **ID prefix**: `WI`
  Prefijo de IDs publicos (`WI-123`, `MT-123`). En ADO los ids numericos (`1234`) siguen validos.
  El commit toma el ID del branch con `^(feature|bugfix)/([A-Z]+-\d+)-` usando este prefijo.

Leer **el contrato del tracker configurado**:

- `ado` → `../references/tracker-contracts-ado.md`
- `notion` → `../references/tracker-contracts-notion.md`

Los nombres de tools coinciden; los procedimientos de las skills no cambian.

## Azure DevOps (cuando Tracker = ado)

- **Azure DevOps Project ID**: `<COMPLETAR_ADO_PROJECT_ID>`
- **Azure DevOps Project Name**: `<COMPLETAR_ADO_PROJECT_NAME>`
- **Azure DevOps Organization**: `<COMPLETAR_ORGANIZATION>`

## Notion (cuando Tracker = notion)

- **Notion US data source id**: `<COMPLETAR_NOTION_US_DATA_SOURCE_ID>`
- **Notion Task data source id**: `<COMPLETAR_NOTION_TASK_DATA_SOURCE_ID>`
- **Notion Bug data source id**: `<COMPLETAR_NOTION_BUG_DATA_SOURCE_ID>`
- **Notion Board URL**: `<COMPLETAR_NOTION_BOARD_URL>`

## Repositorios

El codigo de este proyecto vive en **GitHub**, no en Azure DevOps Repos.

### Repo: `nestjs_cqrs_base`

- **Hosting**: GitHub (`git@github.com:<COMPLETAR_GITHUB_ORG>/nestjs_cqrs_base.git`)
- **Azure DevOps Repository ID**: `N/A` (no aplica; el repo no esta en ADO Repos)
- **Base branch**: `development`
- **Regla de rol/stack**: `dev-role-nestjs_cqrs_base.mdc`
  Generar a partir de `stack-role.template.md` (stack NestJS + CQRS + TypeORM). La usa
  `dev-plan-execution` para las validaciones por iteracion y el testing de cierre.
- **Ubicacion de reglas del proyecto**: `.cursor/rules/`
  Carpeta donde viven las reglas de arquitectura y convenciones del repo. Los flujos leen de aqui las
  reglas necesarias.
- **Pull Requests**: se crean en GitHub con la skill `pr` (no con flujos de PR del tracker).

## Reglas de uso en MCP

- Leer el contrato del tracker configurado antes de invocar tools.
- En ADO, el parametro `project` de las tools oficiales no aplica (server scoped). El
  **Project Name** es referencia humana.
- Operaciones de Pull Request / push: usar GitHub (`gh`) via la skill `pr`.
- No usar `#[numero]` suelto en titulos ni comentarios del tracker (asociaciones automaticas no deseadas).
  El ID con prefijo (`#WI-123`, `#MT-123`) es el formato de commit/PR.

## Leer un work item por ID

Cuando un prompt pida obtener una US o Task existente:

1. Usar MCP `get_work_item` con `id` (numerico ADO o `PREFIX-123` Notion).
   Pedir `includePlainText: true` si el texto va a un prompt.
2. Extraer Title, Description, Acceptance Criteria y Discussion.
   Padre: `get_parent`. Hijos: `get_children`.
3. Si falta el ID o no existe el work item, pedir un ID valido.

## Modelos recomendados por flujo (guia prompts_cursor)

Criterio: usar el modelo mas liviano cuando hay red de seguridad (confirmacion humana, plan escrito,
validaciones automaticas). Subir a Sonnet solo si el juicio del modelo es el entregable.

| Flujo (prompt / skill) | Modelo | Notas |
|---|---|---|
| Setup (`dev-project-config-setup`) | Haiku / Auto | Confirmacion antes de escribir config |
| Generar tareas (`task-generator` / `dev-tasks`) | Sonnet | Un impacto omitido contamina el ciclo |
| Planificar bug (`bug-task-generator` / `dev-bug-fix-tasks`) | Sonnet | Diagnostico + plan con confirmacion |
| Ejecutar plan (`development-plan-execution` / `dev-plan-execution`) | Auto | Plan ya escrito + validaciones del rol |
| Code review (`code-review` / `dev-code-review`) | Sonnet | El review es el entregable |
| Crear PR (skill `pr` en GitHub) | Auto | Aprobacion antes de crear el PR |
| Sprint review (`sprint-review` / `dev-sprint-review`) | Auto / Sonnet | Reporte para humano |

No usar Opus por defecto. No duplicar aqui la politica de tests (vive en `dev-testing-strategy/references/`).
