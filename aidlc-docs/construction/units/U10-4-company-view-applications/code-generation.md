# Code generation: U10-4-company-view-applications

## Implementation plan

1. Add a protected company applications API using company-owned vacancy boundaries.
2. Shape candidate identity fields through existing privacy settings.
3. Add a company applications page that renders application status history without changing state by default.
4. Reuse the shared application lifecycle contract in backend tests and frontend rendering.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/CompanyApplicationsPage.tsx`
- `frontend/src/features/profile/types.ts`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `aidlc-docs/construction/units/U10-4-company-view-applications/code-generation.md`
- `aidlc-docs/construction/units/U10-4-company-view-applications/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the company applications API and page.
- Restore the prior company experience without dedicated application review.

## Review checklist

- Company users can only review applications for their own company
- Candidate identity fields stay privacy-aware
- Current status and history come from the shared application lifecycle
- The review page stays distinct from later interview workflows
