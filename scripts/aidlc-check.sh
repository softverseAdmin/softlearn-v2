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
check_path "aidlc-docs/aidlc-state.md" "file"
check_path "aidlc-docs/inception/v1" "dir"
check_path "changes" "dir"
check_path "templates/unit" "dir"
check_path "scripts" "dir"
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

echo "---"
echo "AI-DLC check summary: OK=${checks_ok} NG=${checks_ng}"

if [ "$checks_ng" -gt 0 ]; then
  exit 1
fi
