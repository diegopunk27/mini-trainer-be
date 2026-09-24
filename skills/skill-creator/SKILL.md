# Skill Creator - NestJS CQRS Base Template

---
name: skill-creator
description: >
  Creates new AI agent skills following el proyecto skill specification. Trigger: When creating new skills, documenting patterns, or adding AI instructions.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Creating new skills"
---

## When to Create a Skill

Create a skill when:
- Pattern is used repeatedly and AI needs guidance
- Project conventions differ from generic practices
- Complex workflows need step-by-step instructions
- Decision trees help AI choose the right approach

**Don't create a skill when:**
- Documentation already exists (reference instead)
- Pattern is trivial or self-explanatory
- It's a one-off task

---

## Skill Structure

```
skills/{skill-name}/
├── SKILL.md              # Required - main skill file
├── assets/               # Optional - templates, schemas, examples
│   └── template.ts
└── references/           # Optional - links to local docs
    └── README.md
```

---

## Naming Conventions

| Type | Pattern | Examples |
|------|---------|----------|
| Generic | `{technology}` | `typescript`, `nestjs-cqrs`, `testing` |
| Process | `{action}` | `commit`, `pr`, `docs` |
| Workflow | `{action}-{target}` | `skill-creator`, `skill-sync` |
| el proyecto-specific | `project-{component}` | `project-cqrs`, `project-api` |

---

## Decision: assets/ vs references/

```
Need code templates?      → assets/
Need schemas/configs?     → assets/
Link to existing docs?    → references/ (local paths)
Link to external guides?  → references/ (local paths)
```

**Key Rule**: `references/` points to LOCAL files, not web URLs.

---

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (lowercase, hyphens) |
| `description` | Yes | What + Trigger in one block |
| `license` | Yes | `MIT` for el proyecto |
| `metadata.author` | Yes | `template-team` |
| `metadata.version` | Yes | Semantic version as string |
| `metadata.scope` | Yes | `[root]` or specific paths |
| `auto_invoke` | Optional | Trigger phrases |

---

## Content Guidelines

### DO
- Start with most critical patterns
- Use tables for decision trees
- Keep code examples minimal
- Include Commands section
- Spanish for business content, English for technical

### DON'T
- Duplicate existing docs (reference instead)
- Include lengthy explanations
- Add troubleshooting sections
- Use web URLs in references

---

## Registering the Skill

After creating skill, add to `AGENTS.md`:

```markdown
| `{skill-name}` | {Description} | [SKILL.md](skills/{skill-name}/SKILL.md) |
```

And to auto_invoke table if applicable:

```markdown
| {Trigger phrase} | {skill-name} |
```

---

## Commands

```bash
# Create skill structure
mkdir -p skills/{skill-name}/assets

# Copy template
cp skills/skill-creator/assets/SKILL-TEMPLATE.md skills/{skill-name}/SKILL.md

# Register in AGENTS.md
# (Manual edit required)
```

---

## Checklist

- [ ] Skill doesn't already exist
- [ ] Pattern is reusable (not one-off)
- [ ] Name follows conventions
- [ ] Frontmatter complete with trigger keywords
- [ ] Critical patterns are clear
- [ ] Code examples are minimal
- [ ] Commands section exists
- [ ] Added to AGENTS.md
- [ ] Added to auto_invoke table if needed

## Resources

- **Template**: See [assets/SKILL-TEMPLATE.md](assets/SKILL-TEMPLATE.md)
