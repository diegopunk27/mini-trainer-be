# Pull Request Guidelines - NestJS CQRS Base Template

---
name: pr
description: >
  Pull Request creation and conventions for NestJS CQRS Base Template. Trigger: When creating PRs, when user asks to create a pull request, or working on PR description.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Create a PR with gh pr create"
    - "Creating a pull request"
    - "Generating PR description"
    - "Filling pull request template"
---

## Critical Rules

- ALWAYS analyze ALL commits from branch divergence, not just the latest commit
- ALWAYS use `git diff development` (or target branch) to see full changes
- ALWAYS extract task number from branch name for PR title
- ALWAYS generate description in Spanish
- ALWAYS focus on "what" and "why", not "how"
- NEVER include implementation details or technical specifics in the description
- NEVER exceed the maximum points specified for each section
- ALWAYS ask for user confirmation before creating PR

---

## PR Creation Process

1. **Identify target branch** (usually `development`)
2. **Analyze ALL changes** since branch divergence
3. **Extract task number** from current branch name
4. **Understand context** from User Story if provided
5. **Generate PR description** following template
6. **Create PR** with `gh pr create`

---

## PR Template Structure

```markdown
# #NROTarea Título Descriptivo

## Motivo de cambio

[Explicar brevemente qué se está haciendo y por qué.
Máximo 3 líneas.
Usar contexto de la US si está disponible.]

## Cambios realizados

- [Cambio principal 1]
- [Cambio principal 2]
- [Cambio principal 3]
- [Cambio principal 4]
- [Cambio principal 5]

[Máximo 5 puntos. Enfocarse en el "qué", no en el "cómo".
Evitar detalles técnicos innecesarios.]

## Impacto

- [Impacto en el usuario final 1]
- [Impacto en el usuario final 2]

[Máximo 2 puntos. Basarse en el contexto de la US.]

## Archivos clave

- `ruta/archivo1.ts`: Descripción breve del cambio
- `ruta/archivo2.ts`: Descripción breve del cambio
- `ruta/archivo3.ts`: Descripción breve del cambio
- `ruta/archivo4.ts`: Descripción breve del cambio
- `ruta/archivo5.ts`: Descripción breve del cambio

[Máximo 5 archivos. Solo los más relevantes.]

## Tareas relacionadas

#MT-123, #456
https://www.notion.so/<workspace>/<page-id>

[IDs de commits `#PREFIX-123` o `#123` (ADO numerico). Si Tracker = notion, se puede agregar el link de la pagina.]
```

---

## Detailed Workflow

### Step 1: Identify Target Branch

```bash
# Usually targeting development
TARGET_BRANCH="development"

# Verify current branch
git branch --show-current

# Example: feature/1234-nueva-funcionalidad
```

### Step 2: Analyze Changes

```bash
# View ALL commits since divergence
git log development..HEAD --oneline

# View complete diff
git --no-pager diff development

# View file statistics
git diff --stat development
```

**IMPORTANT**: Analyze ALL commits, not just the latest one. Understand the full scope of changes.

### Step 3: Extract Task Number

From branch name (`^(feature|bugfix)/([A-Z]+-\d+)-`, prefix from `dev-common/config/dev-project-config.md`):
- `feature/MT-123-descripcion` → Task: `MT-123`
- `bugfix/WI-5678-descripcion` → Task: `WI-5678`
- Numeric ADO ids still work: `feature/1234-descripcion` → `1234`

### Step 4: Understand Context (If User Story Provided)

If the user provides User Story text:
- Extract requirements and acceptance criteria
- Identify business need being addressed
- Understand expected impact on end users
- Use this context to enrich PR sections

### Step 5: Generate PR Description

#### **Motivo de cambio** (Max 3 lines)

Focus on:
- **What** is being done
- **Why** it's needed
- Business problem being solved

Use User Story context if available.

Example:
```
Se identificó la necesidad de optimizar el consumo de recursos durante
la generación de PDFs para usuarios concurrentes, ya que el sistema
actual no puede manejar eficientemente múltiples solicitudes simultáneas.
```

#### **Cambios realizados** (Max 5 points)

List main changes focusing on **what**, not **how**:
- New features added
- Systems integrated
- Configurations updated
- Validations implemented

Avoid technical details like specific parameters or line numbers.

Example:
```
- Migración a imágenes Docker más livianas
- Implementación de sistema de archivos temporales
- Optimización de parámetros de Puppeteer
- Actualización de configuración de Swagger
```

#### **Impacto** (Max 2 points)

Describe impact on end users:
- Performance improvements
- New capabilities
- Better user experience
- Increased reliability

Base this on User Story context.

Example:
```
- Reducción del tiempo de generación de PDFs
- Mayor estabilidad en entornos de producción
```

#### **Archivos clave** (Max 5 files)

List only the most relevant files with brief descriptions:

Example:
```
- `src/pdf-generator/pdf.service.ts`: Optimización de generación
- `docker/Dockerfile.prod`: Configuración de contenedores
- `src/config/puppeteer.config.ts`: Parámetros optimizados
```

#### **Tareas relacionadas**

Extract task IDs from commits that start with `#` (prefixed `MT-123` or numeric ADO `123`):

```bash
git log development..HEAD --pretty=format:"%s" | grep -oE '#[A-Z]+-[0-9]+|#[0-9]+' | sort -u
```

If Tracker = notion, also add the Notion page URL next to the ID.

---

## Complete Example

### Example 1: Performance Optimization

```markdown
# #64387 Optimización de Rendimiento en Generación de PDFs

## Motivo de cambio

Se identificó la necesidad de optimizar el consumo de recursos durante
la generación de PDFs para usuarios concurrentes, ya que el sistema
actual no puede manejar eficientemente múltiples solicitudes simultáneas.

## Cambios realizados

- Migración a imágenes Docker más livianas
- Implementación de sistema de archivos temporales
- Optimización de parámetros de Puppeteer
- Actualización de configuración de Swagger

## Impacto

- Reducción del tiempo de generación de PDFs
- Mayor estabilidad en entornos de producción

## Archivos clave

- `src/pdf-generator/pdf.service.ts`: Optimización de generación
- `docker/Dockerfile.prod`: Configuración de contenedores
- `src/config/puppeteer.config.ts`: Parámetros optimizados

## Tareas relacionadas

#64387
```

### Example 2: New Feature

```markdown
# #1234 Módulo de Gestión de Ítems

## Motivo de cambio

Se requiere un módulo completo para gestionar el ciclo de vida de
ítems, desde su registro hasta su aprobación, para centralizar
la información y facilitar el proceso de onboarding.

## Cambios realizados

- Implementación de módulo de ítems con CQRS
- Sistema de workflow de aprobación multi-nivel
- Integración con Azure AD para autenticación
- Endpoints para carga y descarga de documentos en S3
- Tests E2E para todos los endpoints

## Impacto

- Reducción del tiempo de onboarding de ítems
- Mayor trazabilidad en el proceso de aprobación

## Archivos clave

- `src/modules/item/item.module.ts`: Módulo principal
- `src/modules/item/commands/create-item/`: Lógica de creación
- `src/modules/item/controllers/item.controller.ts`: Endpoints
- `src/modules/item/item.service.ts`: Workflow
- `src/modules/item/tests/create-item.e2e.spec.ts`: Tests

## Tareas relacionadas

#1234, #1235, #1236
```

---

## Creating the PR

### Using GitHub CLI

```bash
# Create PR with heredoc for proper formatting
gh pr create --title "#1234 Título Descriptivo" --body "$(cat <<'EOF'
# #1234 Título Descriptivo

## Motivo de cambio

[Descripción...]

## Cambios realizados

- [Cambio 1]
- [Cambio 2]

## Impacto

- [Impacto 1]

## Archivos clave

- `archivo.ts`: Descripción

## Tareas relacionadas

#1234
EOF
)"

# Create draft PR (for work in progress)
gh pr create --draft --title "WIP: #1234 Título" --body "..."

# View PR in browser
gh pr view --web
```

---

## Important Considerations

### Language

- **All PR content**: Spanish
- **Code/Technical terms**: Keep in English (e.g., "controller", "repository")

### Conciseness

- Keep focused and avoid redundancy
- Prioritize clarity over detail
- Remove unnecessary information

### User Story Context

If User Story text is provided:
- Use it to understand business need
- Identify real impact on users
- Prioritize changes based on US requirements
- Reference US in "Motivo de cambio"

### Tracker Compatibility

- Use markdown compatible with GitHub PRs
- Task IDs: `#MT-123` / `#WI-123` or numeric ADO `#123`
- If Tracker = notion, include the Notion page URL in Tareas relacionadas

---

## Commands Reference

```bash
# Check current state
git status
git branch --show-current

# View commits since divergence
git log development..HEAD --oneline
git log --graph --oneline development..HEAD

# View complete diff
git --no-pager diff development

# View file changes
git diff --stat development
git diff --name-only development

# Extract task IDs from commits
git log development..HEAD --pretty=format:"%s" | grep -oE '#[A-Z]+-[0-9]+|#[0-9]+' | sort -u

# Create PR
gh pr create --title "..." --body "..."

# View PR
gh pr view
gh pr view --web

# Edit PR
gh pr edit <number>
```

---

## Integration with the tracker

The PR is reviewed on GitHub (code + CI). Tracking lives in the configured tracker (`ado` or `notion`).

Ensure:
- Task IDs match the work items (`#MT-123` or numeric ADO)
- If Tracker = notion, add the Notion page link in Tareas relacionadas
- Description provides context for reviewers

---

## PR Title Format

```
#NROTarea Título Descriptivo
```

- **Task number**: From branch name
- **Title**: Concise description (max 10 words)
- **Language**: Spanish
- **Case**: Title Case (capitalize first letter of main words)

Examples:
```
#1234 Implementación de Módulo de Ítems
#5678 Corrección de Error en Validación de Archivos
#9012 Optimización de Consultas de Base de Datos
```

---

## Before Creating PR

Checklist:

- [ ] All commits follow commit conventions
- [ ] Branch is up to date with target branch
- [ ] All tests pass locally
- [ ] Linting passes
- [ ] No merge conflicts
- [ ] Task number extracted correctly
- [ ] PR description is complete and concise
- [ ] Files staged and committed properly
- [ ] No sensitive data in commits

---

## After Creating PR

1. **Verify PR** was created correctly
2. **Share PR URL** with team if needed
3. **Monitor CI checks** (GitHub Actions)
4. **Address review comments** promptly
5. **Update PR** if requested
6. **Squash and merge** to development when approved

---

## Common Mistakes to Avoid

- ❌ Not analyzing all commits (only looking at last one)
- ❌ Including technical implementation details
- ❌ Exceeding maximum points per section
- ❌ Missing task number in title
- ❌ Creating PR without running tests
- ❌ Not waiting for user confirmation
- ❌ Hardcoding values in description
- ❌ Including file paths in "Cambios realizados"
- ❌ Copying commit messages directly to PR
- ❌ Not using User Story context when available

---

**Remember**: The PR description is for reviewers and stakeholders to understand the value and scope of changes without reading the code. Write clearly and focus on business value.
