#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: ./scripts/aidlc-sync.sh <unit-name>"
}

if [ "${1:-}" = "" ]; then
  usage
  exit 1
fi

unit_name="$1"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required but was not found."
  exit 1
fi

echo "Fetching origin..."
git fetch origin

if git show-ref --verify --quiet refs/heads/develop || git ls-remote --exit-code --heads origin develop >/dev/null 2>&1; then
  echo "Run these commands manually to sync safely:"
  echo "  git checkout develop"
  echo "  git pull origin develop"
  echo "  git checkout feature/${unit_name}"
  echo "  git merge develop"
  echo "Review the merge result manually before pushing."
else
  echo "Develop branch not found locally or on origin."
  exit 1
fi
