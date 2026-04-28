#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo 'Usage: ./scripts/aidlc-change.sh "summary"'
}

if [ "${1:-}" = "" ]; then
  usage
  exit 1
fi

summary="$1"
template="changes/CHG-template.md"

if [ ! -f "$template" ]; then
  echo "Template not found: ${template}"
  exit 1
fi

max_id=0
for existing in changes/CHG-*.md; do
  [ -e "$existing" ] || continue
  number="$(basename "$existing" .md | sed 's/^CHG-//')"
  if printf '%s' "$number" | grep -Eq '^[0-9]{3}$' && [ "$number" -gt "$max_id" ]; then
    max_id="$number"
  fi
done

next_id="$(printf '%03d' $((10#$max_id + 1)))"
chg_id="CHG-${next_id}"
destination="changes/${chg_id}.md"
today="$(date +%F)"

if [ -e "$destination" ]; then
  echo "Refusing to overwrite existing file: ${destination}"
  exit 1
fi

sed \
  -e "s/{{CHG_ID}}/${chg_id}/g" \
  -e "s/{{SUMMARY}}/${summary}/g" \
  -e "s/{{DATE}}/${today}/g" \
  "$template" > "$destination"

echo "Created ${destination}"
echo "Fill in reason, impacted units, decision, and status before use."
