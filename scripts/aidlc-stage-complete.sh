#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo 'Usage: ./scripts/aidlc-stage-complete.sh <unit-name> "<stage-name>"'
}

if [ "${1:-}" = "" ] || [ "${2:-}" = "" ]; then
  usage
  exit 1
fi

unit_name="$1"
stage_name="$2"
unit_state="aidlc-docs/construction/units/${unit_name}/unit-state.md"

if [ ! -f "$unit_state" ]; then
  echo "Unit state file not found: ${unit_state}"
  exit 1
fi

available_stages="$(awk '/^- \[[ x]\] / { sub(/^- \[[ x]\] /, ""); print }' "$unit_state")"

if ! printf '%s\n' "$available_stages" | grep -Fxq "$stage_name"; then
  echo "Stage not found: ${stage_name}"
  echo "Available stages:"
  printf '  - %s\n' $available_stages
  exit 1
fi

tmp_file="$(mktemp)"
today="$(date +%F)"

awk -v stage="$stage_name" '
  /^- \[[ x]\] / {
    current=$0
    sub(/^- \[[ x]\] /, "", current)
    if (current == stage) {
      print "- [x] " current
      next
    }
  }
  { print }
' "$unit_state" > "$tmp_file"

awk -v today="$today" '
  BEGIN { last_section=0; replaced=0 }
  {
    if ($0 == "## Last Updated") {
      print
      last_section=1
      next
    }

    if (last_section == 1) {
      print ""
      print today
      replaced=1
      last_section=2
      next
    }

    if (last_section == 2 && !replaced) {
      next
    }

    print
  }
' "$tmp_file" > "${tmp_file}.updated"

mv "${tmp_file}.updated" "$unit_state"
rm -f "$tmp_file"

echo "Marked stage complete: ${stage_name}"
echo "Updated ${unit_state}"
