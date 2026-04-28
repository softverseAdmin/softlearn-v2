#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: ./scripts/aidlc-new-unit.sh <unit-name>"
}

if [ "${1:-}" = "" ]; then
  usage
  exit 1
fi

unit_name="$1"
unit_dir="aidlc-docs/construction/units/${unit_name}"
template_dir="templates/unit"

if ! printf '%s' "$unit_name" | grep -Eq '^U[0-9]+-[0-9]+-[a-z0-9][a-z0-9-]*$'; then
  echo "Invalid unit name: ${unit_name}"
  echo "Expected format: U<phase>-<number>-<kebab-case-name>"
  exit 1
fi

if [ ! -d "$template_dir" ]; then
  echo "Template directory not found: ${template_dir}"
  exit 1
fi

if [ -e "$unit_dir" ]; then
  echo "Unit already exists: ${unit_dir}"
  exit 1
fi

mkdir -p "$unit_dir"

for template_file in "$template_dir"/*.md; do
  base_name="$(basename "$template_file")"
  destination="${unit_dir}/${base_name}"
  sed "s/{{UNIT_NAME}}/${unit_name}/g" "$template_file" > "$destination"
done

echo "Created unit scaffold at ${unit_dir}"

if command -v git >/dev/null 2>&1; then
  current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  if git show-ref --verify --quiet refs/heads/develop; then
    echo "Current branch: ${current_branch:-unknown}"
    echo "Suggested branch command:"
    echo "  git checkout develop && git pull && git checkout -b feature/${unit_name}"
  else
    echo "Git detected, but no local develop branch was found."
  fi
fi

echo "Next steps:"
echo "  1. Fill the unit documents in order."
echo "  2. Update unit-state.md as stages complete."
echo "  3. Run ./scripts/aidlc-check.sh before opening a PR."
