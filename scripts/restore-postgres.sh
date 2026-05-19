#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <backup.sql.gz>" >&2
  exit 1
fi

backup_file="$1"

if [ ! -f "${backup_file}" ]; then
  echo "Backup file not found: ${backup_file}" >&2
  exit 1
fi

gunzip -c "${backup_file}" | psql "${DATABASE_URL}"
