# Skills System - NestJS CQRS Base Template

AI agent skills for consistent development patterns in the NestJS CQRS Base Template project.

## Overview

The skills system provides specialized AI guidance for common development tasks:

- **Core Development**: code-review, typescript, nestjs-cqrs, testing
- **Workflow**: commit, pr, teaching, naming, dev-*
- **Documentation & Meta**: docs, skill-creator, skill-sync

## Quick Start

### Using Skills

Skills are **auto-invoked** based on task context. See [AGENTS.md](../AGENTS.md) for complete mapping.

Examples:
- Creating commits → `commit` skill auto-loads
- Writing tests → `testing` skill auto-loads
- Adding CQRS handlers → `nestjs-cqrs` skill auto-loads

### Creating New Skills

```bash
# 1. Create structure
mkdir -p skills/my-skill/assets

# 2. Copy template
cp skills/skill-creator/assets/SKILL-TEMPLATE.md skills/my-skill/SKILL.md

# 3. Edit SKILL.md
# - Update frontmatter (name, description, auto_invoke)
# - Add critical patterns
# - Add code examples

# 4. Sync to AGENTS.md
./skills/skill-sync/assets/sync.sh
```

### Syncing Skills

After creating/modifying skills:

```bash
# Update AGENTS.md Auto-invoke section
./skills/skill-sync/assets/sync.sh

# Preview changes
./skills/skill-sync/assets/sync.sh --dry-run

# Run tests
./skills/skill-sync/assets/sync_test.sh
```

## Available Skills

| Category | Skills |
|----------|--------|
| **Core Development** | [code-review](code-review/SKILL.md), [typescript](typescript/SKILL.md), [nestjs-cqrs](nestjs-cqrs/SKILL.md), [testing](testing/SKILL.md) |
| **Workflow** | [commit](commit/SKILL.md), [pr](pr/SKILL.md), [teaching](teaching/SKILL.md), [naming](naming/SKILL.md), [dev-common](dev-common/SKILL.md), [dev-tasks](dev-tasks/SKILL.md), [dev-plan-execution](dev-plan-execution/SKILL.md) |
| **Documentation & Meta** | [docs](docs/SKILL.md), [skill-creator](skill-creator/SKILL.md), [skill-sync](skill-sync/SKILL.md) |

## Skill Structure

```
skills/
├── README.md
├── {skill-name}/
│   ├── SKILL.md           # Main skill file (required)
│   ├── assets/            # Templates, scripts (optional)
│   └── references/        # Local docs links (optional)
```

## Skill Anatomy

```yaml
---
name: skill-name
description: >
  What it does.
  Trigger: When to use it.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Trigger phrase 1"
    - "Trigger phrase 2"
---

## When to Use
[Conditions]

## Critical Patterns
[Must-know patterns]

## Code Examples
[Minimal examples]

## Commands
[Copy-paste commands]

## Resources
[Templates, docs]
```

## Design Principles

### Concise & Actionable
- Critical patterns only
- Minimal explanations
- Actionable examples
- No redundancy

### Well-Organized
- Decision trees for approaches
- Tables for reference
- Clear sections
- Logical flow

### Project-Specific
- el proyecto conventions
- Spanish for business, English for technical
- Real project examples

## Maintenance

### Adding Patterns

If pattern is used repeatedly:
1. Check if existing skill covers it
2. Create new skill or extend existing
3. Keep concise and focused
4. Run sync script

### Updating Skills

When conventions change:
1. Update relevant skill(s)
2. Update version in frontmatter
3. Run sync script
4. Verify AGENTS.md updated

### Deprecating Skills

If skill becomes obsolete:
1. Remove skill directory
2. Run sync script to update AGENTS.md
3. Document removal

## Resources

- **Main Router**: [../AGENTS.md](../AGENTS.md) - Project overview and skill index
- **Template**: [skill-creator/assets/SKILL-TEMPLATE.md](skill-creator/assets/SKILL-TEMPLATE.md)
- **Sync Script**: [skill-sync/assets/sync.sh](skill-sync/assets/sync.sh)

---

**Skills are living documentation. Keep them updated as the project evolves.**
