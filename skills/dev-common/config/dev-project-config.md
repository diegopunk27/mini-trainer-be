# Configuracion del proyecto - Mini-Trainer

Este archivo es la configuracion central del desarrollo agentico para Mini-Trainer. Lo leen las
skills `dev-*`. No incluir tokens, PATs ni credenciales (viven en la config del MCP).

> **Topologia de este proyecto**: el tracker es **Notion** (work items y board). El codigo y los
> Pull Requests viven en GitHub (`diegoyanacon/mini-trainer-be`, `mini-trainer-fe`, `mini-trainer-app`),
> gestionados con la skill `pr` (`gh`).

## Tracker

- **Tracker**: `notion`
- **ID prefix**: `MT`
  El commit toma el ID del branch con `^(feature|bugfix)/([A-Z]+-\d+)-` usando este prefijo.

Leer **el contrato del tracker configurado**:

- `notion` → `../references/tracker-contracts-notion.md`

## Notion

Una sola base de work items (Epic, User Story, Task y Bug). El token vive solo en `.cursor/mcp.json`.

- **Notion US data source id**: `4064495b03634db18c5e04e2f070f6be`
- **Notion Task data source id**: `4064495b03634db18c5e04e2f070f6be`
- **Notion Bug data source id**: `4064495b03634db18c5e04e2f070f6be`
- **Notion work items data source id**: `4064495b03634db18c5e04e2f070f6be`
- **Notion sprints data source id**: `1aec9723becd43eeb0c5cb5576f002dc`
- **Notion history data source id**: `5b52bc6ddf5e46b6af78fe8123506acb`
- **Notion Board URL**: `https://app.notion.com/p/Mini-Trainer-288d3cd0d4464b749e5f6204ed157e29?t=3e53593e416480cb828a00a976701ca9`
- **Notion me email**: `diegopunk27@gmail.com`

## Repositorios

### Repo: `mini-trainer-be`

- **Hosting**: GitHub (`git@github.com:diegoyanacon/mini-trainer-be.git`)
- **Base branch**: `development`
- **Regla de rol/stack**: `.cursor/rules/dev-role-mini-trainer-be.mdc`
- **Ubicacion de reglas del proyecto**: `.cursor/rules/`
- **Pull Requests**: GitHub, skill `pr`.

### Repo: `mini-trainer-fe`

- **Hosting**: GitHub (`git@github.com:diegoyanacon/mini-trainer-fe.git`)
- **Base branch**: `development`
- **Regla de rol/stack**: `.cursor/rules/dev-role-mini-trainer-fe.mdc`
- **Ubicacion de reglas del proyecto**: `.cursor/rules/`
- **Pull Requests**: GitHub, skill `pr`.

### Repo: `mini-trainer-app`

- **Hosting**: GitHub (`git@github.com:diegoyanacon/mini-trainer-app.git`)
- **Base branch**: `development`
- **Regla de rol/stack**: `.cursor/rules/dev-role-mini-trainer-app.mdc`
- **Ubicacion de reglas del proyecto**: `.cursor/rules/`
- **Pull Requests**: GitHub, skill `pr`.


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
