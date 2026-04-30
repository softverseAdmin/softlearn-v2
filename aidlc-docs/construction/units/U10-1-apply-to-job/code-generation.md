# Code generation: U10-1-apply-to-job

## Implementation plan

1. Add application and application-status-history backend models plus a protected student apply endpoint.
2. Enforce visible-vacancy eligibility and duplicate active-application prevention.
3. Add the student jobs apply action and a student applications page for immediate result visibility.
4. Cover creation and duplicate-prevention behavior with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/admin.py`
- `backend/users/migrations/0013_application_applicationstatushistory.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/StudentJobsPage.tsx`
- `frontend/src/features/profile/StudentApplicationsPage.tsx`
- `frontend/src/features/profile/types.ts`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `aidlc-docs/construction/units/U10-1-apply-to-job/code-generation.md`
- `aidlc-docs/construction/units/U10-1-apply-to-job/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the application model, API, and student UI additions.
- Restore the prior student jobs page without apply behavior.

## Review checklist

- Students can submit applications only to visible active vacancies
- Duplicate active applications are rejected deterministically
- Initial submitted status and history evidence are created
- Student UI exposes apply and application-tracking flows
