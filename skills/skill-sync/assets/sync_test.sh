#!/usr/bin/env bash
# Unit tests for sync.sh
# Run: ./skills/skill-sync/assets/sync_test.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SYNC_SCRIPT="$SCRIPT_DIR/sync.sh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test environment
TEST_DIR=""

# =============================================================================
# TEST FRAMEWORK
# =============================================================================

setup_test_env() {
    TEST_DIR=$(mktemp -d)

    # Create mock repo structure
    mkdir -p "$TEST_DIR/skills/mock-skill-1"
    mkdir -p "$TEST_DIR/skills/mock-skill-2"
    mkdir -p "$TEST_DIR/skills/mock-skill-multi"
    mkdir -p "$TEST_DIR/skills/mock-no-metadata"
    mkdir -p "$TEST_DIR/skills/skill-sync/assets"

    # Mock skill with single auto_invoke
    cat > "$TEST_DIR/skills/mock-skill-1/SKILL.md" << 'EOF'
---
name: mock-skill-1
description: >
  Mock skill for testing.
  Trigger: When testing.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke: "Creating mock resources"
---

# Mock Skill 1
EOF

    # Mock skill with multiple auto_invoke
    cat > "$TEST_DIR/skills/mock-skill-multi/SKILL.md" << 'EOF'
---
name: mock-skill-multi
description: >
  Mock skill with multiple triggers.
  Trigger: When testing multiple.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Creating tests"
    - "Running tests"
    - "Validating tests"
---

# Mock Skill Multi
EOF

    # Mock skill without auto_invoke
    cat > "$TEST_DIR/skills/mock-no-metadata/SKILL.md" << 'EOF'
---
name: mock-no-metadata
description: >
  Mock skill without auto_invoke.
  Trigger: When testing missing metadata.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
---

# Mock Skill No Metadata
EOF

    # Create AGENTS.md with placeholder
    cat > "$TEST_DIR/AGENTS.md" << 'EOF'
# NestJS CQRS Base - Development Guidelines

## Available Skills

| Skill | Description | URL |
|-------|-------------|-----|
| `mock-skill-1` | Mock skill 1 | [SKILL.md](skills/mock-skill-1/SKILL.md) |
| `mock-skill-multi` | Mock skill multi | [SKILL.md](skills/mock-skill-multi/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Old action | `old-skill` |

---

## Project Overview
EOF

    # Copy sync script to test dir
    cp "$SYNC_SCRIPT" "$TEST_DIR/skills/skill-sync/assets/sync.sh"
}

cleanup_test_env() {
    [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ] && rm -rf "$TEST_DIR"
}

assert_equals() {
    local expected="$1"
    local actual="$2"
    local message="$3"

    if [ "$expected" = "$actual" ]; then
        echo -e "  ${GREEN}✓${NC} $message"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "  ${RED}✗${NC} $message"
        echo -e "    Expected: $expected"
        echo -e "    Actual:   $actual"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

assert_contains() {
    local haystack="$1"
    local needle="$2"
    local message="$3"

    if echo "$haystack" | grep -q "$needle"; then
        echo -e "  ${GREEN}✓${NC} $message"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "  ${RED}✗${NC} $message"
        echo -e "    Expected to find: $needle"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

run_test() {
    local test_name="$1"
    echo ""
    echo -e "${YELLOW}Running: $test_name${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
}

# =============================================================================
# TESTS
# =============================================================================

test_sync_updates_agents() {
    run_test "test_sync_updates_agents"

    cd "$TEST_DIR"
    ./skills/skill-sync/assets/sync.sh > /dev/null 2>&1

    agents_content=$(cat AGENTS.md)

    assert_contains "$agents_content" "Creating mock resources" \
        "Should contain single auto_invoke"

    assert_contains "$agents_content" "Creating tests" \
        "Should contain first multi auto_invoke"

    assert_contains "$agents_content" "Running tests" \
        "Should contain second multi auto_invoke"

    assert_contains "$agents_content" "Validating tests" \
        "Should contain third multi auto_invoke"

    # Old content should be replaced
    if echo "$agents_content" | grep -q "old-skill"; then
        echo -e "  ${RED}✗${NC} Old content should be replaced"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    else
        echo -e "  ${GREEN}✓${NC} Old content replaced"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
}

test_sync_sorted_output() {
    run_test "test_sync_sorted_output"

    cd "$TEST_DIR"
    ./skills/skill-sync/assets/sync.sh > /dev/null 2>&1

    # Extract actions from table
    actions=$(grep -A 100 "### Auto-invoke Skills" AGENTS.md | grep "^|" | grep -v "Action" | grep -v "^|----" | cut -d'|' -f2 | sed 's/^[[:space:]]*//')

    # Check if sorted (case-insensitive)
    sorted_actions=$(echo "$actions" | LC_ALL=C sort -f)

    if [ "$actions" = "$sorted_actions" ]; then
        echo -e "  ${GREEN}✓${NC} Actions are sorted alphabetically"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}✗${NC} Actions should be sorted"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

test_sync_dry_run() {
    run_test "test_sync_dry_run"

    cd "$TEST_DIR"

    # Save original content
    original=$(cat AGENTS.md)

    # Run with dry-run
    ./skills/skill-sync/assets/sync.sh --dry-run > /dev/null 2>&1

    # Content should be unchanged
    current=$(cat AGENTS.md)

    assert_equals "$original" "$current" \
        "Dry run should not modify AGENTS.md"
}

test_detect_missing_metadata() {
    run_test "test_detect_missing_metadata"

    cd "$TEST_DIR"

    output=$(./skills/skill-sync/assets/sync.sh 2>&1)

    assert_contains "$output" "mock-no-metadata" \
        "Should detect skill without auto_invoke"
}

# =============================================================================
# RUN TESTS
# =============================================================================

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Skill Sync Tests${NC}"
echo -e "${YELLOW}========================================${NC}"

setup_test_env

test_sync_updates_agents
test_sync_sorted_output
test_sync_dry_run
test_detect_missing_metadata

cleanup_test_env

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Test Summary${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Tests run:    $TESTS_RUN"
echo -e "${GREEN}Tests passed: $TESTS_PASSED${NC}"

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}Tests failed: $TESTS_FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
