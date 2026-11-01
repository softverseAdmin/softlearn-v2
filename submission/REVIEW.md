# Local application preparation review

Reviewed 2026-11-01 against baseline HEAD `a1739af` in `softlearn-v2/`. The working tree was initially clean. No AGENTS.md was found in the workspace or inspected ancestor locations. Repository guidance was read from `.github/copilot-instructions.md` and `.aidlc-rule-details/common/`.

## Preparation changes

The previous preparation documents and frontend environment example were absent. The README existed but mainly described workflow scaffolding. This pass documents code-backed functionality, adds `frontend/.env.example` with `VITE_API_BASE_URL=/api/v1`, expands ignore patterns, and creates a proposed roadmap and submission drafts. No product behavior, license, ownership declaration, or eligibility answer is added.

Evidence: backend role routes are in `backend/api/url_patterns/`; frontend role routes are in `frontend/src/router/routes/`; configuration is in `backend/config/settings.py` and `frontend/vite.config.ts`; optional Gemini generation is in `backend/services/gemini.py`. Routes establish implementation scope, not that all workflows are correct or production-ready.

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

## Review limits and owner decisions

- The specific BYOP program and current rules were not supplied; eligibility and required disclosures remain unverified.
- Ownership, collaborators, third-party asset rights, and licensing require owner review.
- Real-user and personal-data status remains unknown. No production database or user records were inspected. Use isolated synthetic demonstration data.
- `aidlc-docs/` is absent; the structural checker skips its design-document checks. Do not describe those stages as verified.
- Existing deployment workflows can run on pushes; inspect triggers before any future Git push.
- No commit, push, publication, deployment, license addition, or application submission was performed.

## Local validation

- Backend dependencies installed into ignored `.venv/` from `requirements.txt`; Python 3.12.15 and Django 5.2.18. Backend requirements use ranges, so this is not a fully locked dependency environment.
- `manage.py check`: passed, no issues.
- `manage.py test --noinput`: **293 tests passed** in 36.984 seconds, using an isolated SQLite test database that was destroyed afterward. Demo seeding output came from tests, not an operation on an existing user database.
- The first plain Django invocation failed because inherited configuration disabled debug with no usable secret key. Successful validation used explicit local environment overrides: `ENVIRONMENT=development`, `DJANGO_DEBUG=true`, a test-only `DJANGO_SECRET_KEY`, empty `POSTGRES_DB`, `GEMINI_API_KEY`, and `SENTRY_DSN`, and disabled Redis caching, rate limiting, and Gemini generation. Provider behavior in relevant tests is mocked.
- `npm ci --no-audit --no-fund`: completed; `npm run build` (TypeScript and Vite) and `npm run lint`: passed. Node 26.11.1, npm 11.20.0. The build emitted a Node `module.register()` deprecation warning; CI uses Node 20, which was not retested here.
- `bash scripts/aidlc-check.sh`: passed (6 checks), with design-document checks explicitly skipped because `aidlc-docs/` is absent.
- `git diff --check`: passed. Ignore checks confirmed local env files, SQL/dump exports, logs, and ZIP archives are ignored while `frontend/.env.example` remains trackable.

Validation did not exercise a live PostgreSQL/Redis environment, production settings, a browser walkthrough, real email delivery, or a live Gemini call. No dependency security audit or full secret audit is claimed. Application code and lockfiles were unchanged.
