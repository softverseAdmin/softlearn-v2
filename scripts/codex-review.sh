#!/usr/bin/env bash
set -euo pipefail

prompt="Review this repository for AI-DLC compliance, privacy, security, maintainability, matching explainability, and testing readiness."

if ! command -v codex >/dev/null 2>&1; then
  echo "Codex CLI not installed. Install and run manually."
  if [ "${STRICT_CODEX:-0}" = "1" ]; then
    exit 1
  fi
  exit 0
fi

if codex --help 2>/dev/null | grep -q '\bexec\b'; then
  codex exec "$prompt"
elif codex --help 2>/dev/null | grep -q -- '--prompt'; then
  codex --prompt "$prompt"
else
  echo "Codex CLI is installed, but its prompt interface could not be detected automatically."
  echo "Run this review prompt manually:"
  echo "$prompt"
  if [ "${STRICT_CODEX:-0}" = "1" ]; then
    exit 1
  fi
fi
