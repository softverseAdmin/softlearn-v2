# Project review

Review date: 2026-11-01. Application baseline: `a1739af`.

## Application preparation

The README describes implemented workflows. `ROADMAP.md` proposes future work; `APPLICATION_DRAFT.md` leaves personal and eligibility answers for the owner. Ownership, third-party rights, and real-user data status remain unconfirmed. The owner subsequently selected MIT; the root `LICENSE` records that choice.

## Historical credential finding — unresolved

A local, read-only pattern check confirmed:

- Blob `44251c06d013b0e92617f25e48f021d5cbafede1` exists, contains a Google API-key pattern, and remains reachable from local Git refs.
- `.env.example` at `febad63` contains the pattern; at `5cb7b6d` and current HEAD it does not.
- No currently tracked working-tree file matched that pattern.

The value was neither printed nor tested. These checks do not establish whether the credential is valid, revoked, restricted, used elsewhere, or exposed in remote clones. They are a targeted pattern check, not a comprehensive secret audit.

Owner remediation before sharing history:

1. Identify the credential in the provider console and revoke or rotate it; update any legitimate dependent environment through its secret-management mechanism. Do not test the exposed value.
2. Review provider usage, billing, and available audit records for unexpected activity; restrict any replacement to required APIs and appropriate applications.
3. Review other refs, tags, clones, CI artifacts, archives, and forks for copies. Deleting a current file or adding an ignore pattern cannot erase historical exposure.
4. If history cleanup is chosen, coordinate with collaborators, preserve a controlled recovery copy, plan a reviewed sensitive-data removal across affected refs, and verify the result without displaying secrets. Remote copies and clones require separate coordination. History cleanup does not replace revocation.

No history rewrite or credential action was performed. The owner must explicitly authorize any future rewrite and coordinated remote update.

## Local validation

- Backend dependencies installed into ignored `.venv/` from `requirements.txt`; Python 3.12.15 and Django 5.2.18. Backend requirements use ranges, so this is not a fully locked dependency environment.
- `manage.py check`: passed, no issues.
- `manage.py test --noinput`: **293 tests passed** in 36.984 seconds, using an isolated SQLite test database that was destroyed afterward. Demo seeding output came from tests, not an operation on an existing user database.
- The first plain Django invocation failed because inherited configuration disabled debug with no usable secret key. Successful validation used explicit local environment overrides: `ENVIRONMENT=development`, `DJANGO_DEBUG=true`, a test-only `DJANGO_SECRET_KEY`, empty `POSTGRES_DB`, `GEMINI_API_KEY`, and `SENTRY_DSN`, and disabled Redis caching, rate limiting, and Gemini generation. Provider behavior in relevant tests is mocked.
- `npm ci --no-audit --no-fund`: completed; `npm run build` (TypeScript and Vite) and `npm run lint`: passed. Node 26.11.1, npm 11.20.0. The build emitted a Node `module.register()` deprecation warning; CI uses Node 20, which was not retested here.
- `git diff --check`: passed. Ignore checks confirmed local env files, SQL/dump exports, logs, and ZIP archives are ignored while `frontend/.env.example` remains trackable.

Validation did not exercise a live PostgreSQL/Redis environment, production settings, a browser walkthrough, real email delivery, or a live Gemini call. No dependency security audit or full secret audit is claimed. Application code and lockfiles were unchanged.
