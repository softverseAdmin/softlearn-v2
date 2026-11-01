# Project review

Review date: 2026-11-01. Application baseline: `a1739af`.

## Application preparation

The README describes implemented workflows. `ROADMAP.md` proposes future work. The owner selected MIT and confirmed on 2026-11-01 that Softlearn is a solo personal project developed only with deliberately fictional sample data. The owner reports generating the illustrations and lesson material using AI. Independent rights verification, generation-service terms, and BYOP's eligibility decision remain outstanding. See `SUBMISSION_READINESS.md` and `THIRD_PARTY_REVIEW.md`.

Live authenticated GitHub checks on 2026-11-01 found `softverseAdmin/softlearn-v2` to be **private**, with default branch `main` at `c78e43e531ffed758905bc88bb9a67a1369a0e0e`. The remote LICENSE, README, ROADMAP, and application draft matched local Git blob IDs before this follow-up's edits. Three branch heads, no tags, and eleven pull-request head refs were found. Visibility has not been changed.

## Historical credential finding — unresolved

A local, read-only pattern check confirmed:

- Blob `44251c06d013b0e92617f25e48f021d5cbafede1` exists, contains a Google API-key pattern, and remains reachable from local Git refs.
- `.env.example` at `febad63` contains the pattern; at `5cb7b6d` and current HEAD it does not.
- No currently tracked working-tree file matched that pattern.

The value was neither printed nor tested. On 2026-11-01 the owner subsequently reported deleting the Google Cloud and AI Studio credentials. No provider verification was performed, and that statement does not establish which other copies or uses may exist. The initial checks were targeted, not a comprehensive secret audit.

Owner remediation before sharing history:

1. Owner reports deletion complete. Retain the affected project's non-secret credential identifier and deletion confirmation privately, and update any legitimate dependent environment through its secret-management mechanism. Do not test the exposed value.
2. Review provider usage, billing, and available audit records for unexpected activity; restrict any replacement to required APIs and appropriate applications.
3. Review other refs, tags, clones, CI artifacts, archives, and forks for copies. Deleting a current file or adding an ignore pattern cannot erase historical exposure.
4. If history cleanup is chosen, coordinate with collaborators, preserve a controlled recovery copy, plan a reviewed sensitive-data removal across affected refs, and verify the result without displaying secrets. Remote copies and clones require separate coordination. History cleanup does not replace revocation.

The isolated cleanup was verified and has now been applied to the local `main` lineage, with original Git data and pending edits preserved privately. See `CREDENTIAL_REMEDIATION.md`. The three remote branches have since been updated atomically and verified; eight retained GitHub PR refs still need separate follow-up. Provider deletion was reported by the owner, not performed by this review. No publication or application submission has occurred.

## Local validation

- Backend dependencies installed into ignored `.venv/` from `requirements.txt`; Python 3.12.15 and Django 5.2.18. Backend requirements use ranges, so this is not a fully locked dependency environment.
- `manage.py check`: passed, no issues.
- `manage.py test --noinput`: **293 tests passed** in 36.984 seconds, using an isolated SQLite test database that was destroyed afterward. Demo seeding output came from tests, not an operation on an existing user database.
- The first plain Django invocation failed because inherited configuration disabled debug with no usable secret key. Successful validation used explicit local environment overrides: `ENVIRONMENT=development`, `DJANGO_DEBUG=true`, a test-only `DJANGO_SECRET_KEY`, empty `POSTGRES_DB`, `GEMINI_API_KEY`, and `SENTRY_DSN`, and disabled Redis caching, rate limiting, and Gemini generation. Provider behavior in relevant tests is mocked.
- `npm ci --no-audit --no-fund`: completed; `npm run build` (TypeScript and Vite) and `npm run lint`: passed. Node 26.11.1, npm 11.20.0. The build emitted a Node `module.register()` deprecation warning; CI uses Node 20, which was not retested here.
- `git diff --check`: passed. Ignore checks confirmed local env files, SQL/dump exports, logs, and ZIP archives are ignored while `frontend/.env.example` remains trackable.

Validation did not exercise a live PostgreSQL/Redis environment, production settings, a browser walkthrough, real email delivery, or a live Gemini call. No dependency security audit or full secret audit is claimed. Application code and lockfiles were unchanged.

## Fresh preparation checks

After applying the local cleanup on 2026-11-01, Django's system check passed and all **293 SQLite tests passed in 37.922 seconds**, with the test database destroyed afterward. The frontend build and ESLint passed again. The same isolated environment overrides listed above were used; Gemini provider behavior remained mocked/disabled. The frontend build retained the Node `module.register()` deprecation warning.

Five remaining workflow YAML files and two generic Compose files parsed successfully after removal of the retired hosting integration. Both root and frontend Vercel configuration disable automatic Git deployments for preparation. Private community links and copied navigation instructions were removed from files intended for GitHub. The upstream notices were checked against the installed packages byte-for-byte.

## Applied cleanup outcome

All three mutable GitHub branches were verified after the atomic update. The local repository's old flagged object was removed after private recovery data was saved, remote refs were confirmed, reflogs expired, and garbage collection completed. Candidate published ancestry contained 222 commits (219 mapped originals plus three maintenance commits), 4,406 reachable objects, and no Google-key-pattern matches. Gitleaks' two findings were confirmed documentation/time-expression examples. Remaining GitHub PR refs are recorded in `CREDENTIAL_REMEDIATION.md`; server-wide purging is not claimed.

The repository remains private. No deliberate deployment, public release, or application submission occurred. Program eligibility remains pending receipt of the owner-reported decision.
