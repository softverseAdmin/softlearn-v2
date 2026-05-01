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
9. [Monitoring & Logging](#monitoring--logging)
10. [Troubleshooting](#troubleshooting)
11. [Rollback Procedure](#rollback-procedure)

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

# Security
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://yourdomain.com
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://yourdomain.com
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Email
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@softlearn.com

# Environment
ENVIRONMENT=production
DJANGO_LOG_LEVEL=INFO
```

### Security Configuration

1. **Django Settings** (`backend/config/settings.py`)
   - Ensure `DEBUG = False` in production
   - Set strong `SECRET_KEY`
   - Configure `ALLOWED_HOSTS` properly
   - Enable security middleware

2. **HTTPS**
   - Use `SESSION_COOKIE_SECURE = True` in production
   - Use `CSRF_COOKIE_SECURE = True` in production
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

# Run with gunicorn (production)
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
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
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
pip install -r requirements.txt
npm install

# 3. Collect static files
cd backend
python manage.py collectstatic --noinput

# 4. Run migrations
python manage.py migrate

# 5. Start services
# Use systemd, supervisord, or container orchestration
```

### 3. Post-deployment Verification

```bash
# Check API health
curl https://yourdomain.com/api/v1/health

# Check admin access
curl -H "Authorization: Bearer YOUR_TOKEN" https://yourdomain.com/admin/

# Monitor logs
tail -f /var/log/softlearn/django.log
```

## Monitoring & Logging

### Django Logs

Location: `backend/logs/django.log`

Configure in settings:
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/django.log',
            'maxBytes': 10 * 1024 * 1024,
            'backupCount': 10,
        },
    },
}
```

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
pg_restore -d softlearn_db backup_file.dump
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
