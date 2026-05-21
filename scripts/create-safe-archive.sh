#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(
  cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd
)"
OUTPUT_PATH="${1:-softlearn-source-$(git -C "$REPO_ROOT" rev-parse --short HEAD).zip}"

unstaged_changes="$(git -C "$REPO_ROOT" diff --name-only)"
untracked_changes="$(git -C "$REPO_ROOT" ls-files --others --exclude-standard)"

case "$OUTPUT_PATH" in
  *.zip) ;;
  *)
    echo "Output file must end with .zip" >&2
    exit 1
    ;;
esac

if [ -n "$unstaged_changes" ]; then
  echo "ERROR  Unstaged tracked changes would be omitted from the staged archive." >&2
  printf '  - %s\n' $unstaged_changes >&2
  echo "ERROR  Stage the files you want to ship, then rerun this script." >&2
  exit 1
fi

if [ -n "$untracked_changes" ]; then
  echo "ERROR  Untracked non-ignored files would be omitted from the staged archive." >&2
  printf '  - %s\n' $untracked_changes >&2
  echo "ERROR  Add and stage the files you want to ship, then rerun this script." >&2
  exit 1
fi

if [ "${SKIP_PORTABILITY_VERIFY:-0}" != "1" ]; then
  PORTABILITY_STAGED_ONLY=1 "$REPO_ROOT/scripts/verify-portability.sh"
fi

TREEISH="$(git -C "$REPO_ROOT" write-tree)"

git -C "$REPO_ROOT" archive --format=zip --output "$OUTPUT_PATH" "$TREEISH"
echo "Created $OUTPUT_PATH from staged tracked files only."
