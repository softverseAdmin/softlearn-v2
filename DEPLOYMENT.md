# Softlearn v2 - Deployment Guide

## Table of Contents

1. [Environment Setup](#environment-setup)
2. [Local Development](#local-development)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Docker Deployment](#docker-deployment)
7. [Database Migrations](#database-migrations)
8. [Production Deployment](#production-deployment)
9. [Hetzner VPS Deployment](#hetzner-vps-deployment)
10. [Monitoring & Logging](#monitoring--logging)
11. [Troubleshooting](#troubleshooting)
12. [Rollback Procedure](#rollback-procedure)

## Environment Setup

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (for containerized deployment)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Local Development

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# Run migrations
docker-compose -f docker/docker-compose.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker/docker-compose.yml exec backend python manage.py createsuperuser

# Access applications
# Backend API: http://localhost:8000/api/v1/health
# Frontend: http://localhost:3000
# Admin Panel: http://localhost:8000/admin/
```

`docker/docker-compose.yml` is intentionally **development-only**. It keeps bind mounts, `runserver`, and direct host port exposure for fast iteration. For production-like container runs, use `docker/docker-compose.prod.yml`, run the explicit release container first, then start the steady-state services:

```bash
docker compose -f docker/docker-compose.prod.yml --profile release run --rm backend-release
docker compose -f docker/docker-compose.prod.yml up -d backend worker frontend
```

### Without Docker

#### 1. Start PostgreSQL

```bash
# macOS (using Homebrew)
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows - Use PostgreSQL installer
```

#### 2. Start Redis

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis-server

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

#### 3. Start Backend

```bash
cd backend
python manage.py migrate
python manage.py runserver
```

#### 4. Start Frontend

```bash
cd frontend
npm run dev
```

## Database Setup

### Create Database (PostgreSQL)

```sql
CREATE DATABASE softlearn_db;
CREATE USER softlearn_user WITH PASSWORD 'your_secure_password';
ALTER ROLE softlearn_user SET client_encoding TO 'utf8';
ALTER ROLE softlearn_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE softlearn_user SET default_transaction_deferrable TO on;
ALTER ROLE softlearn_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE softlearn_db TO softlearn_user;
```

### Initial Migration

```bash
cd backend
python manage.py migrate
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Django
DEBUG=False
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
DJANGO_DEBUG=False

# Database
POSTGRES_DB=softlearn_db
POSTGRES_USER=softlearn_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Cache
REDIS_URL=redis://localhost:6379/1
DJANGO_ENABLE_REDIS_CACHE=true

# Security
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://yourdomain.com
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://yourdomain.com
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_SESSION_COOKIE_SAMESITE=None
DJANGO_CSRF_COOKIE_SAMESITE=None

# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@softlearn.com
FRONTEND_URL=https://softlearn-v2.vercel.app
DJANGO_DEFAULT_FROM_EMAIL=noreply@softlearn.com
# Optional: override the fallback backend if you are not using SendGrid
# DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend

# Gemini exam generation (backend / Render)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_EXAM_GENERATION_ENABLED=true
GEMINI_EXAM_REQUEST_TIMEOUT_SECONDS=15
GEMINI_EXAM_MAX_OUTPUT_TOKENS=768
GEMINI_EXAM_SOURCE_CHAR_LIMIT=4000
GEMINI_EXAM_DEFAULT_QUESTION_COUNT=5
GEMINI_EXAM_FINAL_QUESTION_COUNT=15

# Environment
ENVIRONMENT=production
DJANGO_LOG_LEVEL=INFO
DJANGO_LOG_AS_JSON=true
DJANGO_ENABLE_FILE_LOGGING=false
DJANGO_PERSIST_REQUEST_LOGS=false
DJANGO_PERSIST_APP_DIAGNOSTIC_LOGS=false
DJANGO_PERSIST_ERROR_REPORTS=false
CELERY_BROKER_URL=redis://your-redis-service:6379/2
CELERY_RESULT_BACKEND=redis://your-redis-service:6379/2
MATCHING_ASYNC_REFRESH_ENABLED=true
```

If your frontend is hosted on Vercel and the backend is hosted on Render, set the Gemini variables on **Render only**. Vercel only needs the backend API base URL such as `VITE_API_BASE_URL=https://your-render-service.onrender.com/api/v1`.

For Django session auth and CSRF to work across Vercel and Render, also make sure Render has:

```env
ENVIRONMENT=production
DJANGO_DEBUG=false
DJANGO_SECRET_KEY=generate-a-long-random-secret-key-for-this-environment
DJANGO_ALLOWED_HOSTS=softlearn-v2.onrender.com
DJANGO_CORS_ALLOWED_ORIGINS=https://softlearn-v2.vercel.app
DJANGO_CSRF_TRUSTED_ORIGINS=https://softlearn-v2.vercel.app
DJANGO_SESSION_COOKIE_SECURE=true
DJANGO_CSRF_COOKIE_SECURE=true
DJANGO_SESSION_COOKIE_SAMESITE=None
DJANGO_CSRF_COOKIE_SAMESITE=None
DJANGO_ENABLE_REDIS_CACHE=true
DJANGO_ENABLE_RATE_LIMITING=true
DJANGO_TRUSTED_PROXY_IPS=your-reverse-proxy-ip
```

The backend now defaults to secure cross-site cookies only in production and trusts the proxy HTTPS headers Render sends, while local development keeps localhost-friendly defaults.

Production no longer silently falls back to `LocMemCache`. If `ENVIRONMENT=production` and Redis/shared cache is not configured, the backend now refuses to boot. That is deliberate: shared-state features should fail fast during deployment instead of degrading per process in live traffic.

Match snapshot refreshes now have a real Celery path instead of staying purely synchronous inside request threads. That does not magically solve the whole matching architecture, but it does give you an honest async foundation for warming heavy match snapshots behind Redis-backed workers.

Profile and company images are still stored as base64 data URLs in database text fields. That is acceptable for local demos, but it is not production-grade at scale: it inflates row size, backups, replication traffic, and response payloads. Move those assets to object storage plus file references before any serious production growth.

The database schema also still carries structural debt that becomes expensive over time. Core business entities use JSON fields for company domains, preferred skills, vacancy posting details, and audit-style metadata, which weakens queryability and integrity compared with normalized relational tables. Core tables also still embed heavy text payloads such as lesson content/transcripts and image blobs; keep that in mind for database sizing, replication cost, and future extraction work.

To reduce the immediate pain on hot paths, the backend now adds explicit composite indexes for the most common vacancy and application access patterns (`company + status`, `student + status`, `vacancy + status`, and `student + vacancy`). Those indexes help today, but they do not remove the longer-term need to split oversized payloads and overstuffed app boundaries.

Database-backed request logs and error reports are now explicitly diagnostic and opt-in. Production observability should go to structured stdout, your platform log stream, and an external error tracker like Sentry; the primary app database should not be your default log warehouse.

### Deployment pipeline

`.github/workflows/deploy.yml` now performs a real environment deployment instead of stopping at image publication:

1. Build and publish backend/frontend images to GHCR.
2. Trigger the Render backend deploy hook.
3. Trigger the Vercel frontend deploy hook.

Configure these **GitHub environment secrets** for both `staging` and `production`:

```text
RENDER_DEPLOY_HOOK_URL
VERCEL_DEPLOY_HOOK_URL
```

The workflow remains `workflow_dispatch`-driven so production rollout stays explicit.

### Hetzner VPS deployment

The repo now includes a **Hetzner-specific image rollout path** that keeps the current production container topology:

- `docker/docker-compose.hetzner.yml` - image-based runtime compose for the VPS
- `docker/nginx/softlearn.hetzner.conf` - system nginx site template for the VPS
- `.github/workflows/deploy-hetzner.yml` - GHCR publish + SSH deploy workflow

This is the intended Hetzner shape:

```text
Internet
  -> Cloudflare (optional but recommended)
  -> Hetzner VPS system nginx
  -> frontend container on 127.0.0.1:8080
  -> backend container on internal Docker network
  -> postgres + redis + worker on internal Docker network
```

#### What to create in the Hetzner dashboard

Create these resources:

1. **One Cloud server**
   - Location: `Singapore`
   - Image: `Ubuntu 24.04`
   - Type: `CX22` minimum
   - Public IPv4: enabled
   - SSH key: add the Mac SSH public key you will use for deployment
2. **One firewall**
   - Inbound TCP `22` from your admin IPs only
   - Inbound TCP `80` from `0.0.0.0/0` and `::/0`
   - Inbound TCP `443` from `0.0.0.0/0` and `::/0`
   - No public `5432`, `6379`, `8000`, or `8080`
3. **Reverse DNS / hostname**
   - Set a hostname such as `app.yourdomain.com`
4. **Optional volume/backups**
   - Recommended once the environment matters beyond testing

You do **not** need a Hetzner load balancer for a single-VPS rollout.

#### Initial server bootstrap

```bash
ssh root@YOUR_SERVER_IP
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg lsb-release git nginx certbot python3-certbot-nginx

mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

mkdir -p /apps/softlearn/docker
```

Copy the nginx template into place:

```bash
cp /apps/softlearn/docker/nginx/softlearn.hetzner.conf /etc/nginx/sites-available/softlearn
ln -sf /etc/nginx/sites-available/softlearn /etc/nginx/sites-enabled/softlearn
nginx -t
systemctl reload nginx
```

If you are bootstrapping from this repository checkout instead of the workflow upload, the source template lives at `docker/nginx/softlearn.hetzner.conf`.

#### VPS environment file

Create `/apps/softlearn/.env` from `.env.example` and set production values. For Hetzner, the important differences are:

```env
ENVIRONMENT=production
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DJANGO_CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DJANGO_SESSION_COOKIE_SECURE=true
DJANGO_CSRF_COOKIE_SECURE=true
DJANGO_SESSION_COOKIE_SAMESITE=Lax
DJANGO_CSRF_COOKIE_SAMESITE=Lax
DJANGO_ENABLE_REDIS_CACHE=true
DJANGO_ENABLE_RATE_LIMITING=true
DJANGO_TRUSTED_PROXY_IPS=127.0.0.1,172.16.0.0/12
POSTGRES_DB=softlearn
POSTGRES_USER=softlearn
POSTGRES_PASSWORD=replace-this
FRONTEND_URL=https://yourdomain.com
DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
REDIS_URL=redis://redis:6379/1
CELERY_BROKER_URL=redis://redis:6379/2
CELERY_RESULT_BACKEND=redis://redis:6379/2
MATCHING_ASYNC_REFRESH_ENABLED=true
```

`DJANGO_TRUSTED_PROXY_IPS` now supports both exact IPs and CIDR ranges. That matters on Hetzner because backend traffic reaches Django through Docker/Nginx proxy layers, so trusting only one static IP is too brittle.

#### GitHub configuration for automated Hetzner deploys

Create these **GitHub environment secrets** on the target environment (`staging` or `production`) before using `.github/workflows/deploy-hetzner.yml`:

```text
HETZNER_HOST
HETZNER_USER
HETZNER_PORT
HETZNER_SSH_PRIVATE_KEY
```

Recommended values:

- `HETZNER_HOST`: VPS public IP or deploy hostname
- `HETZNER_USER`: `root` or your deploy user
- `HETZNER_PORT`: `22`
- `HETZNER_SSH_PRIVATE_KEY`: private key matching the public key installed on the VPS

The workflow now uses the job-scoped `GITHUB_TOKEN` for GHCR login on the VPS, so you do **not** need separate `GHCR_USERNAME` or `GHCR_READ_TOKEN` environment secrets. This avoids package-read PAT drift and keeps the pull credentials aligned with the exact workflow run that published the images.

The workflow will:

1. build and push backend/frontend images to GHCR
2. upload `docker/docker-compose.hetzner.yml` to `/apps/softlearn/docker/`
3. pull the new images on the VPS
4. run the release container for migrations
5. start backend, worker, and frontend containers
6. verify `http://127.0.0.1:8080/healthz` and `http://127.0.0.1:8080/api/v1/ready`

The deploy workflow now passes `--env-file .env` to every Hetzner `docker compose` command so required values such as `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` are loaded explicitly from `/apps/softlearn/.env` during compose interpolation.

Branch behavior is now:

- `main`: runs CI and automatically deploys to the `production` GitHub environment on every push
- `dev`: runs CI only, so it stays safe for localhost-focused development without touching the VPS
- `workflow_dispatch`: still available when you want to run the Hetzner workflow manually for `staging` or rerun `production`

#### First manual rollout on the VPS

After the workflow secrets and `/apps/softlearn/.env` exist, you can either run the GitHub workflow or do the first rollout manually:

```bash
cd /apps/softlearn
export BACKEND_IMAGE=ghcr.io/OWNER/REPO/hetzner/production-backend:YOUR_SHA
export FRONTEND_IMAGE=ghcr.io/OWNER/REPO/hetzner/production-frontend:YOUR_SHA

docker compose -f docker/docker-compose.hetzner.yml pull
docker compose -f docker/docker-compose.hetzner.yml up -d postgres redis
docker compose -f docker/docker-compose.hetzner.yml --profile release run --rm backend-release
docker compose -f docker/docker-compose.hetzner.yml up -d backend worker frontend
```

Then enable TLS:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Security Configuration

1. **Django Settings** (`backend/config/settings.py`)
   - Ensure `DEBUG = False` in production
   - Set strong `SECRET_KEY`
   - Configure `ALLOWED_HOSTS` properly
   - Enable security middleware

2. **HTTPS**
   - Use `DJANGO_SESSION_COOKIE_SECURE=True` in production
   - Use `DJANGO_CSRF_COOKIE_SECURE=True` in production
   - Use `DJANGO_SESSION_COOKIE_SAMESITE=None` and `DJANGO_CSRF_COOKIE_SAMESITE=None` for cross-site frontend deployments
   - Configure HSTS headers

3. **Rate Limiting**
   - Login: 5 attempts per minute
   - API: 100 requests per minute per user
   - Signup: 1 per minute per IP

## Running the Application

### Backend

```bash
cd backend

# Run development server
python manage.py runserver

# Run explicit release tasks
/usr/local/bin/backend-release-entrypoint.sh

# Run the production web process
/usr/local/bin/backend-web-entrypoint.sh

# Run the async worker process
/usr/local/bin/backend-worker-entrypoint.sh
```

### Frontend

```bash
cd frontend

# Development
npm run dev

# Production build
npm run build

# Serve production build
npm run preview
```

## Docker Deployment

### Build Images

```bash
# Backend
docker build -f docker/Dockerfile.backend -t softlearn-backend:latest .

# Frontend
docker build -f docker/Dockerfile.frontend -t softlearn-frontend:latest .
```

### Run with Docker Compose

```bash
cd docker
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Kubernetes Deployment

For Kubernetes, ensure you have:
- ConfigMaps for environment variables
- Secrets for sensitive data
- PersistentVolumes for data storage
- Service definitions for networking

## Database Migrations

### Create New Migration

```bash
cd backend
python manage.py makemigrations app_name --name migration_name
```

### Apply Migrations

```bash
python manage.py migrate

# Specific app
python manage.py migrate app_name

# Check migration status
python manage.py showmigrations
```

### Rollback Migration

```bash
# Rollback to specific migration
python manage.py migrate app_name migration_name

# Rollback to beginning
python manage.py migrate app_name zero
```

## Production Deployment

### 1. Pre-deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and merged to main branch
- [ ] Environment variables configured
- [ ] Database backups in place
- [ ] SSL/TLS certificates valid
- [ ] Monitoring and logging configured
- [ ] Sentry error tracking configured

### 2. Deployment Steps

```bash
# 1. Trigger the GitHub deploy workflow for the target environment.
#
# 2. Run release tasks explicitly before shifting traffic:
docker compose -f docker/docker-compose.prod.yml --profile release run --rm backend-release
#
# 3. Start or refresh the steady-state processes:
docker compose -f docker/docker-compose.prod.yml up -d backend worker frontend
```

### 3. Post-deployment Verification

```bash
# Check liveness
curl https://yourdomain.com/api/v1/health

# Check readiness (database/cache/logging posture)
curl https://yourdomain.com/api/v1/ready

# Check admin access
curl -H "Authorization: Bearer YOUR_TOKEN" https://yourdomain.com/admin/

# Monitor structured container logs
docker logs -f <backend-container>
```

## Monitoring & Logging

### Runtime logs

- Production should prefer JSON logs on stdout with `DJANGO_LOG_AS_JSON=true`.
- File logging is optional and should only be enabled when the platform does not already aggregate stdout/stderr.
- Request logs are **not** persisted to the database by default; enabling `DJANGO_PERSIST_REQUEST_LOGS=true` is intended for short-lived debugging windows, not steady-state production traffic.
- If `MATCHING_ASYNC_REFRESH_ENABLED=true`, monitor the Celery worker separately from the web process.

### Health endpoints

- `GET /api/v1/health` — liveness probe with request ID.
- `GET /api/v1/ready` — readiness probe with database/cache checks and current observability mode.

### Application Logs

Access via `/api/v1/admin/logs/` endpoint (admin only):

```bash
# Get last 7 days of logs
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/v1/admin/logs/?days=7&level=ERROR"

# Filter by service
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/v1/admin/logs/?service=api"
```

### Error Tracking (Sentry)

Errors are automatically captured and sent to Sentry if `SENTRY_DSN` is configured.

View errors: `https://sentry.io/organizations/yourorg/issues/`

### Performance Monitoring

- Cache metrics: `/api/v1/admin/cache/`
- Security metrics: `/api/v1/admin/security/`
- Error reports: `/api/v1/admin/errors/`

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U softlearn_user -d softlearn_db

# Check Django database connection
cd backend
python manage.py dbshell
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping

# Clear cache
redis-cli FLUSHDB

# Check Redis status
redis-cli INFO stats
```

### Missing Migrations

```bash
# Show missing migrations
python manage.py showmigrations --list

# Create new migrations
python manage.py makemigrations
```

### Static Files Not Serving

```bash
# Collect static files
python manage.py collectstatic --noinput --clear

# Check file permissions
ls -la backend/staticfiles/
```

### Frontend Build Errors

```bash
# Clear node_modules and reinstall
rm -rf frontend/node_modules frontend/package-lock.json
cd frontend
npm install
npm run build
```

## Rollback Procedure

### Code Rollback

```bash
# Revert to previous commit
git revert <commit-hash>
git push origin main

# Or reset to previous tag
git reset --hard <tag>
git push origin main --force
```

### Database Rollback

```bash
# Rollback migrations
python manage.py migrate app_name <migration_name>

# Restore from backup
DATABASE_URL=postgres://... ./scripts/restore-postgres.sh backups/softlearn-YYYYMMDDTHHMMSSZ.sql.gz
```

### Container Rollback

```bash
# Pull previous image
docker pull softlearn-backend:previous-tag

# Update docker-compose.yml with previous tag
docker-compose up -d

# Verify deployment
docker-compose logs backend
```

### Emergency Rollback

1. Notify team of incident
2. Switch to previous image version
3. Rollback database if needed
4. Monitor error logs
5. Post-incident review

## Support

For issues and questions:
- Check logs: `backend/logs/django.log`
- Review error tracking: Sentry dashboard
- Check system resources: CPU, memory, disk
- Contact DevOps team for infrastructure issues
