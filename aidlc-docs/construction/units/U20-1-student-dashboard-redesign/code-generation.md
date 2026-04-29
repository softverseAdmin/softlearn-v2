# Code generation: U20-1-student-dashboard-redesign

## Implementation plan

1. Add the frontend design-system foundation needed for the redesigned dashboard, including Tailwind setup if required.
2. Update the student dashboard backend response so it returns:
   - continue-learning summary
   - next-action object
   - progress-overview object
   - roadmap-preview nodes
3. Split the student dashboard frontend into focused action-first components.
4. Replace the old metric-card-dominant student dashboard view with the redesigned flow.
5. Update backend tests and frontend types to match the new response contract.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/package.json`
- `frontend/src/features/dashboard/types.ts`
- `frontend/src/pages/DashboardPage.tsx`
- New student-dashboard components under `frontend/src/features/dashboard/`
- Frontend styling/config files needed for the redesign

## Test plan

- `. .venv/bin/activate && cd backend && python manage.py check && python manage.py test`
- `cd frontend && npm run build && npm run lint`
- `chmod +x scripts/*.sh && ./scripts/aidlc-check.sh`

## Rollback plan

- Revert the U20-1 code and restore the prior student dashboard response and page composition.
- Remove any new styling/config files that are only required for this redesign unit.

## Review checklist

- Does the student dashboard clearly show the next action?
- Is the UI minimal and learner-focused?
- Is the behavior still deterministic and role-safe?
- Does the redesign remain readable on mobile and tablet?
- Do backend and frontend contracts match exactly?
