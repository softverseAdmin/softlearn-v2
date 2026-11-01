# AI-DLC Learning & Career Matching Platform

This repository is an **AI-DLC-first** workspace for a learning and job-matching platform aimed at foreign IT engineers, Japanese learners, companies, and platform administrators. The product is built **unit by unit**, and the current implementation baseline uses the accepted v1 stack: **Django + React + PostgreSQL** with **session-based auth** and **local-first development**.

## What this repository contains

- AI-DLC operating rules, review gates, and change-management standards
- Inception documents for requirements, personas, feature decomposition, architecture, security, infrastructure, and technology selection
- Construction unit templates and initial unit folders
- Scripts for creating units, completing stages, opening change requests, syncing branches, and running repository checks
- GitHub workflow and template scaffolding for disciplined delivery

## Main users

- **Students / learners**
- **Companies**
- **Admins**

## Main domains

- Learning
- Exams
- Exam preparation
- Company vacancies
- Matching
- Interviews
- Privacy and permissions
- Admin management

## Working model

1. Complete inception and baseline documents.
2. Select the technology stack through documented comparison and ADR approval.
3. Implement construction units in small, reviewable branches and pull requests.
4. Track requirement changes through CHG records instead of silent edits.

## Selected stack

- **Backend:** Django
- **Frontend:** React + Vite
- **Database:** PostgreSQL
- **Auth:** Django-native session-based browser auth
- **Deployment direction:** local-first now, AWS-compatible later
- **Matching approach:** deterministic rule-based and weighted scoring

## Quick start

1. Run:
   ```bash
   chmod +x scripts/*.sh
   ```
2. Run:
   ```bash
   ./scripts/aidlc-check.sh
   ```
3. Start a unit:
   ```bash
   ./scripts/aidlc-new-unit.sh U1-2-authentication-core
   ```
4. Complete a stage:
   ```bash
   ./scripts/aidlc-stage-complete.sh U1-2-authentication-core "Functional Design"
   ```
5. Create a change request:
   ```bash
   ./scripts/aidlc-change.sh "Change summary here"
   ```
6. Create PR:
   ```bash
   ./scripts/creating-pr.sh U1-2-authentication-core
   ```

## Backend quick start

1. Create and activate a virtual environment:
   ```bash
   python3.12 -m venv .venv
   . .venv/bin/activate
   ```
   Use any **Python 3.11+** interpreter. On some macOS machines, `python` and `python3` still point to 3.9, which cannot install Django 5.
2. Install backend dependencies:
   ```bash
   python -m pip install --upgrade pip
   pip install -r requirements.txt
   ```
3. Copy environment defaults:
   ```bash
   cp .env.example .env
   ```
4. Set a non-default secret key in `.env` before sharing the backend beyond local development.
5. Never share or deploy a raw zip of the working tree. Stage the files you want to share, then run `./scripts/verify-portability.sh` and `./scripts/create-safe-archive.sh` so `.env`, virtualenvs, `node_modules`, logs, media, SQLite, and build artifacts stay out.
6. Run migrations:
   ```bash
   cd backend
   python manage.py migrate
   ```
7. Start the backend:
   ```bash
   python manage.py runserver
   ```
8. Run backend tests:
   ```bash
   python manage.py test
   ```

### Production readiness note

- `python manage.py check --deploy` intentionally validates **production** configuration, so it will fail unless you set production env such as `ENVIRONMENT=production`, `DJANGO_ALLOWED_HOSTS`, `POSTGRES_DB`, `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and a real `DJANGO_EMAIL_BACKEND`.
- The repository targets **Python 3.11+**. `.python-version` is set to `3.12` for local version managers, and `./scripts/verify-portability.sh` now auto-selects a supported interpreter instead of silently using an older `python3`.

### Backend foundation notes

- Signup uses Django password validation rules, so weak passwords are rejected at account creation time.
- User-role invariants are enforced at the model level: company users must belong to a company, while student and admin users must not.
- CI sets an explicit Django secret key for backend validation instead of relying on development defaults.
- GitHub Actions runs CI on `main` and `dev`. Deployment is manual-only during repository preparation.

## Frontend quick start

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm ci
   ```
2. Copy optional frontend env defaults:
   ```bash
   cp .env.example .env.local
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
4. Build the frontend:
   ```bash
   npm run build
   ```

5. Re-verify a portable handoff or deployment snapshot from the repository root:
   ```bash
   ./scripts/verify-portability.sh
   ```

### Frontend foundation notes

- The frontend lives in `frontend/` and uses **React + Vite + TypeScript**.
- It restores the authenticated Django session on app load through `/api/v1/auth/session`.
- Protected writes stay CSRF-aware through the backend `/api/v1/auth/csrf` endpoint.
- The app uses one shared router with public, protected, student, company, and admin route areas.

## Important guardrail

Keep implementation aligned with the accepted ADR-001 stack, the completed AI-DLC unit docs, session-based auth, `/api/v1/`, privacy-aware authorization, and deterministic matching rules.
