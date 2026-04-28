#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: ./scripts/creating-pr.sh <unit-name>"
}

if [ "${1:-}" = "" ]; then
  usage
  exit 1
fi

unit_name="$1"

if command -v gh >/dev/null 2>&1; then
  gh pr create --base develop --head "feature/${unit_name}"
else
  echo "gh CLI not found."
  echo "Create the PR manually with:"
  echo "  base branch: develop"
  echo "  head branch: feature/${unit_name}"
fi
