#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

mkdir -p backups
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
output_file="${OUTPUT_FILE:-backups/softlearn-${timestamp}.sql.gz}"

pg_dump "${DATABASE_URL}" --clean --if-exists --no-owner --no-privileges | gzip > "${output_file}"
echo "Backup written to ${output_file}"
