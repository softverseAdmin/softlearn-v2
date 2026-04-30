# Code generation: U20-4-admin-dashboard-redesign

## Implementation plan

1. Update the admin dashboard backend response so it returns:
   - system stats
   - recent activity log
   - compact system-status rows
2. Represent revenue honestly as unavailable until billing exists.
3. Replace the old admin dashboard metrics layout with a compact operations-focused component.
4. Update backend tests, frontend types, and dashboard routing usage to match the new response contract.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/dashboard/types.ts`
- `frontend/src/pages/DashboardPage.tsx`
- New admin-dashboard component under `frontend/src/features/dashboard/`
- `aidlc-docs/aidlc-state.md`
- `aidlc-docs/construction/units/U20-4-admin-dashboard-redesign/`

## Test plan

- `. .venv/bin/activate && cd backend && python manage.py check && python manage.py test`
- `cd frontend && npm run build && npm run lint`
- `chmod +x scripts/*.sh && ./scripts/aidlc-check.sh`

## Rollback plan

- Revert the U20-4 code and restore the prior admin dashboard response and page composition.
- Remove any new admin-dashboard component files that are only required for this redesign unit.

## Review checklist

- Does the admin dashboard stay compact and operations-focused?
- Is revenue shown honestly as unavailable?
- Is the activity log useful without becoming a raw data dump?
- Does the redesign remain readable on mobile and tablet?
- Do backend and frontend contracts match exactly?
