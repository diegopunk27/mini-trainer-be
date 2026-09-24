#!/bin/bash

# Skills Setup Script for NestJS CQRS Base
# Creates symlinks for AI coding assistants to discover skills

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$PROJECT_ROOT/skills"

echo "==================================="
echo "Base Template BE - Skills Setup"
echo "==================================="
echo ""

# Check if skills directory exists
if [ ! -d "$SKILLS_DIR" ]; then
  echo -e "${RED}Error: skills/ directory not found at $SKILLS_DIR${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Found skills directory: $SKILLS_DIR"
echo ""

# Function to create symlink
create_symlink() {
  local target_dir=$1
  local link_name=$2
  local full_path="$PROJECT_ROOT/$target_dir"

  # Create parent directory if it doesn't exist
  mkdir -p "$(dirname "$full_path")"

  # Remove existing symlink or directory
  if [ -L "$full_path" ]; then
    rm "$full_path"
    echo -e "${YELLOW}  Removed existing symlink${NC}"
  elif [ -d "$full_path" ]; then
    echo -e "${YELLOW}  Warning: $target_dir already exists as a directory. Skipping.${NC}"
    return
  fi

  # Create symlink
  ln -s "$SKILLS_DIR" "$full_path"

  if [ -L "$full_path" ]; then
    echo -e "${GREEN}✓${NC} Created: $target_dir → skills/"
  else
    echo -e "${RED}✗${NC} Failed to create: $target_dir"
  fi
}

echo "Creating symlinks for AI coding assistants..."
echo ""

# Claude Code / OpenCode
echo "📦 Claude Code / OpenCode"
create_symlink ".claude/skills" "Claude Code"
echo ""

# Codex (OpenAI)
echo "📦 Codex (OpenAI)"
create_symlink ".codex/skills" "Codex"
echo ""

# GitHub Copilot
echo "📦 GitHub Copilot"
create_symlink ".github/skills" "GitHub Copilot"
echo ""

# Gemini CLI
echo "📦 Gemini CLI"
create_symlink ".gemini/skills" "Gemini CLI"
echo ""

echo "==================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Restart your AI coding assistant"
echo "2. Skills will be automatically discovered"
echo "3. Use /help or invoke skills by name"
echo ""
echo "Available skills:"
echo "  - project    (Project overview)"
echo "  - teaching  (Teaching mode)"
echo "  - naming    (Naming conventions)"
echo "  - commit             (Commit guidelines)"
echo "  - pr                 (PR guidelines)"
echo ""
echo "For more info, read: AGENTS.md"
echo ""
