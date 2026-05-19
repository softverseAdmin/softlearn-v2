#!/bin/sh
set -eu

python manage.py collectstatic --noinput --clear

exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-4}" \
  --timeout "${GUNICORN_TIMEOUT:-60}"
