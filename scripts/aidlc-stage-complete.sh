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

checked_count="$(awk '/^- \[x\] / { count++ } END { print count + 0 }' "$tmp_file")"

if [ "$checked_count" -eq 0 ]; then
  new_status="not_started"
elif [ "$checked_count" -eq 5 ]; then
  new_status="completed"
else
  new_status="in_progress"
fi

awk -v status="$new_status" '
  /^Status:/ {
    print "Status: " status
    next
  }
  { print }
' "$tmp_file" > "${tmp_file}.status"

awk -v today="$today" '
  BEGIN { last_section=0 }
  {
    if ($0 == "## Last Updated") {
      print
      print ""
      print today
      last_section=2
      next
    }

    if (last_section == 2) {
      next
    }

    print
  }
 ' "${tmp_file}.status" > "${tmp_file}.updated"

mv "${tmp_file}.updated" "$unit_state"
rm -f "$tmp_file" "${tmp_file}.status"

echo "Marked stage complete: ${stage_name}"
echo "Set status to: ${new_status}"
echo "Updated ${unit_state}"
