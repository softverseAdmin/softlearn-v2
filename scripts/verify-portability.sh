#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(
  cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd
)"
TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/softlearn-portability.XXXXXX")"
FRONTEND_DIR="$TMP_DIR/frontend"
BACKEND_DIR="$TMP_DIR/backend"
VENV_DIR="$TMP_DIR/.venv"

choose_supported_python() {
  local candidates=()
  local candidate

  if [ -n "${PORTABILITY_PYTHON_BIN:-}" ]; then
    candidates+=("${PORTABILITY_PYTHON_BIN}")
  fi

  candidates+=(python3.12 python3.11 python3.10 python3 python)

  for candidate in "${candidates[@]}"; do
    if ! command -v "$candidate" >/dev/null 2>&1; then
      continue
    fi

    if "$candidate" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)' >/dev/null 2>&1; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  echo "ERROR  Python 3.11+ is required. Install python3.11+ or set PORTABILITY_PYTHON_BIN to a supported interpreter." >&2
  exit 1
}

PYTHON_BIN="$(choose_supported_python)"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

handoff_blockers=(
  ".env"
  ".venv"
  "backend/.venv"
  "backend/venv"
  "frontend/node_modules"
  "frontend/dist"
  "backend/staticfiles"
  "backend/db.sqlite3"
  "backend/logs"
  "backend/media"
)

present_blockers=()
for blocker in "${handoff_blockers[@]}"; do
  if [ -e "$REPO_ROOT/$blocker" ]; then
    present_blockers+=("$blocker")
  fi
done

if [ "${#present_blockers[@]}" -gt 0 ]; then
  echo "NOTICE  Raw working tree contains local-only artifacts:"
  printf '  - %s\n' "${present_blockers[@]}"
  echo "NOTICE  Share source with ./scripts/create-safe-archive.sh, not by uploading the working tree."
fi

mkdir -p "$TMP_DIR"

if [ "${PORTABILITY_STAGED_ONLY:-0}" = "1" ]; then
  TREEISH="$(git -C "$REPO_ROOT" write-tree)"
  git -C "$REPO_ROOT" archive --format=tar "$TREEISH" | tar -xf - -C "$TMP_DIR"
else
  TEMP_INDEX="$TMP_DIR/worktree.index"
  cp "$REPO_ROOT/.git/index" "$TEMP_INDEX"
  GIT_INDEX_FILE="$TEMP_INDEX" git -C "$REPO_ROOT" add -u
  TREEISH="$(GIT_INDEX_FILE="$TEMP_INDEX" git -C "$REPO_ROOT" write-tree)"
  GIT_INDEX_FILE="$TEMP_INDEX" git -C "$REPO_ROOT" archive --format=tar "$TREEISH" | tar -xf - -C "$TMP_DIR"

  while IFS= read -r -d '' untracked_path; do
    case "$untracked_path" in
      .env|.env.*|.venv|.venv/*|backend/.venv|backend/.venv/*|backend/venv|backend/venv/*|frontend/node_modules|frontend/node_modules/*|frontend/dist|frontend/dist/*|backend/staticfiles|backend/staticfiles/*|backend/db.sqlite3|backend/logs|backend/logs/*|backend/media|backend/media/*)
        continue
        ;;
    esac

    mkdir -p "$TMP_DIR/$(dirname "$untracked_path")"
    cp "$REPO_ROOT/$untracked_path" "$TMP_DIR/$untracked_path"
  done < <(git -C "$REPO_ROOT" ls-files --others --exclude-standard -z)
fi

rm -rf \
  "$TMP_DIR/.env" \
  "$TMP_DIR/.venv" \
  "$TMP_DIR/backend/.venv" \
  "$TMP_DIR/backend/venv" \
  "$TMP_DIR/frontend/node_modules" \
  "$TMP_DIR/frontend/dist" \
  "$TMP_DIR/backend/staticfiles" \
  "$TMP_DIR/backend/db.sqlite3" \
  "$TMP_DIR/backend/logs" \
  "$TMP_DIR/backend/media"

for forbidden_path in .env .venv backend/.venv backend/venv frontend/node_modules frontend/dist backend/db.sqlite3 backend/logs backend/media; do
  if [ -e "$TMP_DIR/$forbidden_path" ]; then
    echo "ERROR  Exported snapshot unexpectedly contains $forbidden_path" >&2
    exit 1
  fi
done

if [ ! -f "$FRONTEND_DIR/package-lock.json" ]; then
  echo "ERROR  frontend/package-lock.json is required for npm ci portability checks." >&2
  exit 1
fi

echo "Running clean frontend install and build..."
(
  cd "$FRONTEND_DIR"
  rm -rf node_modules dist
  npm ci
  npm run build
)

echo "Running clean backend dependency install and Django checks..."
echo "Using Python interpreter: $("$PYTHON_BIN" --version 2>&1)"
"$PYTHON_BIN" -m venv "$VENV_DIR"
"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/pip" install -r "$TMP_DIR/requirements.txt"
(
  cd "$BACKEND_DIR"
  DJANGO_SECRET_KEY=portability-check-secret \
    ENVIRONMENT=development \
    "$VENV_DIR/bin/python" manage.py check
  DJANGO_SECRET_KEY=portability-production-secret-key-that-is-long-and-random-123456 \
    DJANGO_DEBUG=false \
    ENVIRONMENT=production \
    DJANGO_ALLOWED_HOSTS=example.com \
    POSTGRES_DB=softlearn \
    POSTGRES_HOST=localhost \
    POSTGRES_USER=softlearn \
    POSTGRES_PASSWORD=softlearn \
    POSTGRES_PORT=5432 \
    DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend \
    DJANGO_ENABLE_REDIS_CACHE=true \
    REDIS_URL=redis://127.0.0.1:6379/1 \
    DJANGO_SECURE_HSTS_PRELOAD=true \
    "$VENV_DIR/bin/python" manage.py check --deploy
  DJANGO_SECRET_KEY=portability-check-secret \
    ENVIRONMENT=development \
    "$VENV_DIR/bin/python" manage.py migrate --noinput
  DJANGO_SECRET_KEY=portability-check-secret \
    ENVIRONMENT=development \
    "$VENV_DIR/bin/python" manage.py migrate --check
  DJANGO_SECRET_KEY=portability-check-secret \
    ENVIRONMENT=development \
    "$VENV_DIR/bin/python" manage.py test
)

echo "Portability verification passed from a clean tracked snapshot."
