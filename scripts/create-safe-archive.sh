#!/usr/bin/env bash
set -euo pipefail

OUTPUT_PATH="${1:-softlearn-source-$(git rev-parse --short HEAD).zip}"

case "$OUTPUT_PATH" in
  *.zip) ;;
  *)
    echo "Output file must end with .zip" >&2
    exit 1
    ;;
esac

TREEISH="$(git write-tree)"

git archive --format=zip --output "$OUTPUT_PATH" "$TREEISH"
echo "Created $OUTPUT_PATH from staged tracked files only."
