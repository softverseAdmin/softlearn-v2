#!/usr/bin/env bash
set -euo pipefail

required_unit_files=(
  "unit-state.md"
  "functional-design.md"
  "nfr-requirements.md"
  "nfr-design.md"
  "infrastructure-design.md"
  "code-generation.md"
)

checks_ok=0
checks_ng=0

report_ok() {
  echo "OK  $1"
  checks_ok=$((checks_ok + 1))
}

report_ng() {
  echo "NG  $1"
  checks_ng=$((checks_ng + 1))
}

check_path() {
  path="$1"
  type="$2"
  if [ "$type" = "file" ] && [ -f "$path" ]; then
    report_ok "$path"
  elif [ "$type" = "dir" ] && [ -d "$path" ]; then
    report_ok "$path"
  else
    report_ng "$path"
  fi
}

check_path "README.md" "file"
check_path ".github/copilot-instructions.md" "file"
check_path ".aidlc-rule-details" "dir"
check_path "changes" "dir"
check_path "templates/unit" "dir"
check_path "scripts" "dir"

if [ ! -d "aidlc-docs" ]; then
  echo "INFO  aidlc-docs not present. Skipping AI-DLC documentation checks."
  echo "---"
  echo "AI-DLC check summary: OK=${checks_ok} NG=${checks_ng}"
  exit 0
fi

check_path "aidlc-docs/aidlc-state.md" "file"
check_path "aidlc-docs/inception/v1" "dir"
check_path "aidlc-docs/inception/v1/adr-001-technology-stack.md" "file"

if [ -d "aidlc-docs/construction/units" ]; then
  report_ok "aidlc-docs/construction/units"
  found_unit_dir=0
  for unit_dir in aidlc-docs/construction/units/*; do
    [ -d "$unit_dir" ] || continue
    found_unit_dir=1
    for required_file in "${required_unit_files[@]}"; do
      if [ -f "${unit_dir}/${required_file}" ]; then
        report_ok "${unit_dir}/${required_file}"
      else
        report_ng "${unit_dir}/${required_file}"
      fi
    done
  done

  if [ "$found_unit_dir" -eq 0 ]; then
    report_ng "aidlc-docs/construction/units/*"
  fi
else
  report_ng "aidlc-docs/construction/units"
fi

if [ -f "aidlc-docs/aidlc-state.md" ]; then
  current_active_unit="$(
    awk -F'\\*\\*Current active unit:\\*\\* ' '/\*\*Current active unit:\*\*/ { print $2 }' aidlc-docs/aidlc-state.md
  )"

  if [ -n "$current_active_unit" ] && [ "$current_active_unit" != "None" ]; then
    if [ -d "aidlc-docs/construction/units/${current_active_unit}" ]; then
      report_ok "aidlc-docs/aidlc-state.md current active unit"
    else
      report_ng "aidlc-docs/aidlc-state.md current active unit"
    fi
  fi

  while IFS= read -r completed_unit; do
    [ -n "$completed_unit" ] || continue
    if [ -f "aidlc-docs/construction/units/${completed_unit}/unit-state.md" ] &&
      grep -Fqx "Status: completed" "aidlc-docs/construction/units/${completed_unit}/unit-state.md"; then
      report_ok "aidlc-docs/aidlc-state.md completed unit ${completed_unit}"
    else
      report_ng "aidlc-docs/aidlc-state.md completed unit ${completed_unit}"
    fi
  done <<EOF
$(awk '
  /^## Completed units$/ { in_completed=1; next }
  /^## Open CHG$/ { in_completed=0 }
  in_completed && /^\| U[0-9]+-[0-9]+-/ { print $2 }
' aidlc-docs/aidlc-state.md)
EOF
fi

for unit_state in aidlc-docs/construction/units/*/unit-state.md; do
  [ -f "$unit_state" ] || continue

  checked_count="$(grep -c '^- \[x\] ' "$unit_state" || true)"
  status_value="$(awk -F': ' '/^Status:/ { print $2 }' "$unit_state")"

  if [ "$checked_count" -eq 0 ]; then
    expected_status="not_started"
  elif [ "$checked_count" -eq 5 ]; then
    expected_status="completed"
  else
    expected_status="in_progress"
  fi

  if [ "$status_value" = "$expected_status" ]; then
    report_ok "${unit_state} status"
  else
    report_ng "${unit_state} status"
  fi

  last_updated_entries="$(
    awk '
      /^## Last Updated$/ { in_last_updated=1; next }
      /^## / && in_last_updated { exit }
      in_last_updated && $0 !~ /^[[:space:]]*$/ { count++ }
      END { print count + 0 }
    ' "$unit_state"
  )"

  if [ "$last_updated_entries" -eq 1 ]; then
    report_ok "${unit_state} last-updated"
  else
    report_ng "${unit_state} last-updated"
  fi
done

echo "---"
echo "AI-DLC check summary: OK=${checks_ok} NG=${checks_ng}"

if [ "$checks_ng" -gt 0 ]; then
  exit 1
fi
