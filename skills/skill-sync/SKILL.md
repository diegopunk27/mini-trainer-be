# Skill Sync - NestJS CQRS Base

---
name: skill-sync
description: >
  Syncs skill metadata to AGENTS.md Auto-invoke section. Trigger: When updating skill metadata, regenerating Auto-invoke tables, or running sync.sh.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "After creating/modifying a skill"
    - "Regenerate AGENTS.md Auto-invoke tables"
    - "Troubleshoot why a skill is missing from AGENTS.md"
---

## When to Use

Use this skill when:
- New skill added to `skills/` directory
- Skill metadata changed (auto_invoke field)
- AGENTS.md Auto-invoke section is out of sync
- Need to verify all skills are registered

---

## Required Skill Metadata

Each skill that should appear in Auto-invoke section needs `auto_invoke` in metadata:

```yaml
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]

  # Single action
  auto_invoke: "Creating commits"

  # Or multiple actions
  # auto_invoke:
  #   - "Creating commits"
  #   - "Committing changes"
```

---

## Usage

### After Creating/Modifying a Skill

```bash
# Run sync script
./skills/skill-sync/assets/sync.sh

# Or dry-run to preview changes
./skills/skill-sync/assets/sync.sh --dry-run
```

### What It Does

1. Reads all `skills/*/SKILL.md` files
2. Extracts `metadata.auto_invoke` from each
3. Generates sorted Auto-invoke table
4. Updates `### Auto-invoke Skills` section in AGENTS.md

---

## Example

Given this skill metadata:

```yaml
# skills/commit/SKILL.md
metadata:
  auto_invoke:
    - "Creating commits"
    - "Committing changes"
```

Sync script generates in AGENTS.md:

```markdown
### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Committing changes | `commit` |
| Creating commits | `commit` |
```

---

## Commands

```bash
# Sync AGENTS.md
./skills/skill-sync/assets/sync.sh

# Dry run (preview changes)
./skills/skill-sync/assets/sync.sh --dry-run

# Run tests
./skills/skill-sync/assets/sync_test.sh
```

---

## Checklist After Modifying Skills

- [ ] Added `metadata.auto_invoke` to skill
- [ ] Ran `./skills/skill-sync/assets/sync.sh`
- [ ] Verified AGENTS.md updated correctly
- [ ] All actions sorted alphabetically

## Resources

- **Sync Script**: [assets/sync.sh](assets/sync.sh)
- **Test Script**: [assets/sync_test.sh](assets/sync_test.sh)
- **Main Router**: [../../AGENTS.md](../../AGENTS.md)
