#!/usr/bin/env bash
# Validate Skills System Setup
# Usage: ./skills/validate-skills.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}Skills System Validation${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Helper functions
check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

# Check 1: AGENTS.md exists
echo -e "${BLUE}[1/10] Checking AGENTS.md exists...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "$REPO_ROOT/AGENTS.md" ]; then
    check_pass "AGENTS.md found"
else
    check_fail "AGENTS.md not found"
fi
echo ""

# Check 2: Skills directory exists
echo -e "${BLUE}[2/10] Checking skills directory...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d "$SCRIPT_DIR" ]; then
    skill_count=$(find "$SCRIPT_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l)
    check_pass "Skills directory found with $skill_count skills"
else
    check_fail "Skills directory not found"
fi
echo ""

# Check 3: All skills have SKILL.md
echo -e "${BLUE}[3/10] Checking SKILL.md files...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
missing_skill_md=0
for skill_dir in "$SCRIPT_DIR"/*/; do
    skill_name=$(basename "$skill_dir")
    if [ ! -f "$skill_dir/SKILL.md" ]; then
        check_fail "$skill_name missing SKILL.md"
        missing_skill_md=$((missing_skill_md + 1))
    fi
done
if [ $missing_skill_md -eq 0 ]; then
    check_pass "All skills have SKILL.md"
fi
echo ""

# Check 4: All skills have valid frontmatter
echo -e "${BLUE}[4/10] Checking skill frontmatter...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
invalid_frontmatter=0
for skill_file in "$SCRIPT_DIR"/*/SKILL.md; do
    skill_name=$(basename "$(dirname "$skill_file")")

    # Check frontmatter exists
    if ! grep -q "^---$" "$skill_file"; then
        check_fail "$skill_name: Missing frontmatter"
        invalid_frontmatter=$((invalid_frontmatter + 1))
        continue
    fi

    # Check required fields
    frontmatter=$(sed -n '/^---$/,/^---$/p' "$skill_file")

    if ! echo "$frontmatter" | grep -q "^name:"; then
        check_fail "$skill_name: Missing 'name' field"
        invalid_frontmatter=$((invalid_frontmatter + 1))
    fi

    if ! echo "$frontmatter" | grep -q "^description:"; then
        check_fail "$skill_name: Missing 'description' field"
        invalid_frontmatter=$((invalid_frontmatter + 1))
    fi

    if ! echo "$frontmatter" | grep -q "^license:"; then
        check_fail "$skill_name: Missing 'license' field"
        invalid_frontmatter=$((invalid_frontmatter + 1))
    fi

    if ! echo "$frontmatter" | grep -q "metadata:"; then
        check_fail "$skill_name: Missing 'metadata' section"
        invalid_frontmatter=$((invalid_frontmatter + 1))
    fi
done

if [ $invalid_frontmatter -eq 0 ]; then
    check_pass "All skills have valid frontmatter"
fi
echo ""

# Check 5: All skills have auto_invoke metadata
echo -e "${BLUE}[5/10] Checking auto_invoke metadata...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
missing_auto_invoke=0
for skill_file in "$SCRIPT_DIR"/*/SKILL.md; do
    skill_name=$(basename "$(dirname "$skill_file")")

    if ! grep -A 10 "metadata:" "$skill_file" | grep -q "auto_invoke"; then
        check_fail "$skill_name: Missing auto_invoke"
        missing_auto_invoke=$((missing_auto_invoke + 1))
    fi
done

if [ $missing_auto_invoke -eq 0 ]; then
    check_pass "All skills have auto_invoke metadata"
fi
echo ""

# Check 6: All skills registered in AGENTS.md
echo -e "${BLUE}[6/10] Checking skills registered in AGENTS.md...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
unregistered=0
for skill_dir in "$SCRIPT_DIR"/*/; do
    skill_name=$(basename "$skill_dir")
    if ! grep -q "\`$skill_name\`" "$REPO_ROOT/AGENTS.md"; then
        check_fail "$skill_name not registered in AGENTS.md"
        unregistered=$((unregistered + 1))
    fi
done

if [ $unregistered -eq 0 ]; then
    check_pass "All skills registered in AGENTS.md"
fi
echo ""

# Check 7: Auto-invoke section exists in AGENTS.md
echo -e "${BLUE}[7/10] Checking Auto-invoke section...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if grep -q "### Auto-invoke Skills" "$REPO_ROOT/AGENTS.md"; then
    action_count=$(grep -c "| .* | \`.*\` |" "$REPO_ROOT/AGENTS.md" || echo "0")
    check_pass "Auto-invoke section found with $action_count actions"
else
    check_fail "Auto-invoke section not found in AGENTS.md"
fi
echo ""

# Check 8: Sync script exists and is executable
echo -e "${BLUE}[8/10] Checking sync script...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "$SCRIPT_DIR/skill-sync/assets/sync.sh" ]; then
    if [ -x "$SCRIPT_DIR/skill-sync/assets/sync.sh" ]; then
        check_pass "Sync script exists and is executable"
    else
        check_fail "Sync script exists but is not executable"
        echo "         Run: chmod +x $SCRIPT_DIR/skill-sync/assets/sync.sh"
    fi
else
    check_fail "Sync script not found"
fi
echo ""

# Check 9: Test script exists
echo -e "${BLUE}[9/10] Checking test script...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "$SCRIPT_DIR/skill-sync/assets/sync_test.sh" ]; then
    if [ -x "$SCRIPT_DIR/skill-sync/assets/sync_test.sh" ]; then
        check_pass "Test script exists and is executable"
    else
        check_warn "Test script exists but is not executable"
        echo "         Run: chmod +x $SCRIPT_DIR/skill-sync/assets/sync_test.sh"
    fi
else
    check_fail "Test script not found"
fi
echo ""

# Check 10: No TypeScript files in assets (should be .md)
echo -e "${BLUE}[10/10] Checking for TypeScript files in assets...${NC}"
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
ts_files=$(find "$SCRIPT_DIR" -path "*/assets/*.ts" 2>/dev/null | wc -l)
if [ "$ts_files" -eq 0 ]; then
    check_pass "No .ts files in assets (correctly using .md)"
else
    check_fail "Found $ts_files .ts files in assets"
    echo "         Assets should be .md files to avoid build errors"
    find "$SCRIPT_DIR" -path "*/assets/*.ts" -exec echo "         - {}" \;
fi
echo ""

# Summary
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}Summary${NC}"
echo -e "${BLUE}=======================================${NC}"
echo ""
echo -e "Total checks:  $TOTAL_CHECKS"
echo -e "${GREEN}Passed:        $PASSED_CHECKS${NC}"
if [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "${RED}Failed:        $FAILED_CHECKS${NC}"
else
    echo -e "Failed:        $FAILED_CHECKS"
fi
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Skills system is ready.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please fix the issues above.${NC}"
    exit 1
fi
