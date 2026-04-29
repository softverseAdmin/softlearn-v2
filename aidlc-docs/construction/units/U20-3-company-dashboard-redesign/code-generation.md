# Code generation: U20-3-company-dashboard-redesign

## Implementation plan

1. Update the company dashboard backend response so it returns:
   - candidates-to-review cards
   - active-jobs summary list
   - interview follow-up summary
   - small analytics counters
2. Keep candidate score output deterministic and visibility-aware.
3. Split the company dashboard frontend into focused hiring-first components.
4. Replace the old company metric-card view with the redesigned SaaS flow.
5. Update backend tests, frontend types, and dashboard routing usage to match the new response contract.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/dashboard/types.ts`
- `frontend/src/pages/DashboardPage.tsx`
- New company-dashboard components under `frontend/src/features/dashboard/`
- `aidlc-docs/aidlc-state.md`
- `aidlc-docs/construction/units/U20-3-company-dashboard-redesign/`

## Test plan

- `. .venv/bin/activate && cd backend && python manage.py check && python manage.py test`
- `cd frontend && npm run build && npm run lint`
- `chmod +x scripts/*.sh && ./scripts/aidlc-check.sh`

## Rollback plan

- Revert the U20-3 code and restore the prior company dashboard response and page composition.
- Remove any new company-dashboard components that are only required for this redesign unit.

## Review checklist

- Does the company dashboard clearly show who to review next?
- Is the UI minimal and hiring-focused?
- Is candidate score output privacy-safe and deterministic?
- Does the redesign remain readable on mobile and tablet?
- Do backend and frontend contracts match exactly?
