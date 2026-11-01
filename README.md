# Softlearn v2

Softlearn is a personal learning and career-matching platform under development, aimed at learners and IT career opportunities in Japan. The repository contains an implemented Django backend and React/TypeScript frontend.

## Implemented application

- Students: course enrollment, lesson progress, assessments, practice questions, profiles, job browsing, applications, matches, interviews, and messaging.
- Teachers: course and lesson management, exam and student views, and course previews.
- Companies: vacancies, applications, candidate review, interviews, messaging, and course previews.
- Administrators: user, company, course, exam, and vacancy management, with reporting and operational endpoints.
- Privacy-related endpoints: visibility settings, consent, access logs, export requests, and deletion requests. Their existence is not a claim of compliance or completed operational review.
- Deterministic matching; optional Gemini-backed assessment generation is separate from matching and requires explicit service configuration.

These capabilities are represented in `backend/api/url_patterns/`, `backend/users/`, and `frontend/src/router/routes/`. Implementation does not establish production readiness, user adoption, or the quality of every workflow.

## Stack and layout

- Django 5, session authentication and CSRF protection; API prefix `/api/v1`.
- React 18, TypeScript, Vite, and Tailwind CSS.
- SQLite when `POSTGRES_DB` is unset; PostgreSQL configuration is available.
- Optional Redis/Celery services for caching and background work.
- `backend/`: models, services, API routes, migrations, and Django tests.
- `frontend/`: browser application and build tooling.
- `changes/`: recorded product and design decisions.

## Application preparation

See [ROADMAP.md](ROADMAP.md) for proposed development, [application draft](submission/APPLICATION_DRAFT.md), [review](submission/REVIEW.md), and [licensing and release decisions](submission/LICENSING_AND_RELEASE.md). These are local preparation documents, not a submitted application or a determination of BYOP eligibility.

User-data status is unconfirmed. Use a separate local database with deliberately synthetic records for demonstrations; do not copy production data or expose real profiles, resumes, messages, or assessment results.

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
5. Before any future authorized handoff, review the files and use `./scripts/verify-portability.sh` and `./scripts/create-safe-archive.sh` to exclude local artifacts. These helpers do not establish that Git history is free of secrets; resolve the historical finding in `submission/REVIEW.md` before sharing history.
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
- GitHub Actions runs CI on `main` and `dev`, while pushes to `main` also auto-deploy to the Hetzner production environment.

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
- The app uses one shared router with public, protected, student, teacher, company, and admin route areas.

## Contributing

Keep changes focused and document significant behavior changes. Run Django tests, the frontend build, and ESLint before proposing application changes. Review authorization, student privacy, and matching explanations when those areas are affected.

This project is licensed under the [MIT License](LICENSE). Third-party dependencies and materials retain their respective licenses. Confirm ownership and third-party rights before public distribution. A historical secret pattern remains in Git history; see `submission/REVIEW.md` before sharing the repository or an archive.
