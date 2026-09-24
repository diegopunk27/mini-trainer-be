#!/usr/bin/env bash
# Sync skill metadata to AGENTS.md Auto-invoke section
# Usage: ./sync.sh [--dry-run]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
SKILLS_DIR="$REPO_ROOT/skills"
AGENTS_FILE="$REPO_ROOT/AGENTS.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Options
DRY_RUN=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--dry-run]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would change without modifying files"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Extract YAML frontmatter field
extract_field() {
    local file="$1"
    local field="$2"
    awk -v field="$field" '
        /^---$/ { in_frontmatter = !in_frontmatter; next }
        in_frontmatter && $1 == field":" {
            sub(/^[^:]+:[[:space:]]*/, "")
            if ($0 != "" && $0 != ">") {
                gsub(/^["'\'']|["'\'']$/, "")
                print
                exit
            }
        }
    ' "$file"
}

# Extract metadata.auto_invoke
# Supports single string or list
extract_auto_invoke() {
    local file="$1"
    awk '
        /^---$/ { in_frontmatter = !in_frontmatter; next }
        in_frontmatter && /^metadata:/ { in_metadata = 1; next }
        in_frontmatter && in_metadata && /^[a-z]/ && !/^[[:space:]]/ { in_metadata = 0 }

        in_frontmatter && in_metadata && /^[[:space:]]+auto_invoke:/ {
            sub(/^[[:space:]]+auto_invoke:[[:space:]]*/, "")

            # Single string
            if ($0 != "") {
                gsub(/^["'\'']|["'\'']$/, "")
                gsub(/^[[:space:]]+|[[:space:]]+$/, "")
                print
                exit
            }

            # List of strings
            while (getline) {
                if ($0 ~ /^---$/) break
                if ($0 ~ /^[a-z]/ && $0 !~ /^[[:space:]]/) break
                if ($0 ~ /^[[:space:]]*-[[:space:]]*/) {
                    sub(/^[[:space:]]*-[[:space:]]*/, "")
                    gsub(/^["'\'']|["'\'']$/, "")
                    gsub(/^[[:space:]]+|[[:space:]]+$/, "")
                    if ($0 != "") print
                }
            }
            exit
        }
    ' "$file"
}

echo -e "${BLUE}Skill Sync - Updating AGENTS.md Auto-invoke section${NC}"
echo "========================================================"
echo ""

# Check if AGENTS.md exists
if [ ! -f "$AGENTS_FILE" ]; then
    echo -e "${RED}Error: AGENTS.md not found at $AGENTS_FILE${NC}"
    exit 1
fi

# Collect all auto_invoke triggers with their skills
declare -a actions_skills=()

while IFS= read -r skill_file; do
    [ -f "$skill_file" ] || continue

    skill_name=$(extract_field "$skill_file" "name")
    [ -z "$skill_name" ] && continue

    # Extract auto_invoke (can be multiple lines)
    while IFS= read -r action; do
        [ -z "$action" ] && continue
        actions_skills+=("$action	$skill_name")
    done < <(extract_auto_invoke "$skill_file")

done < <(find "$SKILLS_DIR" -mindepth 2 -maxdepth 2 -name SKILL.md -print | sort)

# Build Auto-invoke table
auto_invoke_section="### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|"

# Sort by action, then skill (for stable output)
while IFS=$'\t' read -r action skill_name; do
    [ -z "$action" ] && continue
    auto_invoke_section="$auto_invoke_section
| $action | \`$skill_name\` |"
done < <(printf "%s\n" "${actions_skills[@]}" | LC_ALL=C sort -t $'\t' -k1,1 -k2,2)

if $DRY_RUN; then
    echo -e "${YELLOW}[DRY RUN] Would update $AGENTS_FILE with:${NC}"
    echo "$auto_invoke_section"
    echo ""
else
    # Write section to temp file
    section_file=$(mktemp)
    echo "$auto_invoke_section" > "$section_file"

    # Check if Auto-invoke section exists
    if grep -q "### Auto-invoke Skills" "$AGENTS_FILE"; then
        # Replace existing section
        awk '
            /^### Auto-invoke Skills/ {
                while ((getline line < "'"$section_file"'") > 0) print line
                close("'"$section_file"'")
                skip = 1
                next
            }
            skip && /^(---|## )/ {
                skip = 0
                print ""
            }
            !skip { print }
        ' "$AGENTS_FILE" > "$AGENTS_FILE.tmp"
        mv "$AGENTS_FILE.tmp" "$AGENTS_FILE"
        echo -e "${GREEN}✓ Updated Auto-invoke section in AGENTS.md${NC}"
    else
        echo -e "${YELLOW}Warning: '### Auto-invoke Skills' section not found in AGENTS.md${NC}"
        echo -e "${YELLOW}Please add the section manually at the appropriate location${NC}"
    fi

    rm -f "$section_file"
fi

echo ""

# Show skills without auto_invoke metadata
echo -e "${BLUE}Skills missing auto_invoke metadata:${NC}"
missing=0
while IFS= read -r skill_file; do
    [ -f "$skill_file" ] || continue
    skill_name=$(extract_field "$skill_file" "name")
    auto_invoke=$(extract_auto_invoke "$skill_file")

    if [ -z "$auto_invoke" ]; then
        echo -e "  ${YELLOW}$skill_name${NC}"
        missing=$((missing + 1))
    fi
done < <(find "$SKILLS_DIR" -mindepth 2 -maxdepth 2 -name SKILL.md -print | sort)

if [ $missing -eq 0 ]; then
    echo -e "  ${GREEN}All skills have auto_invoke metadata${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"
