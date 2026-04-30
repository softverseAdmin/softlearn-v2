# Code generation: U10-2-application-status-tracking

## Implementation plan

1. Add the shared application status vocabulary to the backend application model.
2. Add application status-history persistence and serialization for student and company views.
3. Reuse shared status transitions from apply, withdraw, shortlist, and reject flows.
4. Expose ordered history in both student and company application pages.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0013_application_applicationstatushistory.py`
- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentApplicationsPage.tsx`
- `frontend/src/features/profile/CompanyApplicationsPage.tsx`
- `aidlc-docs/construction/units/U10-2-application-status-tracking/code-generation.md`
- `aidlc-docs/construction/units/U10-2-application-status-tracking/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the shared application status and history additions.
- Restore the app to the prior state without application lifecycle persistence.

## Review checklist

- One authoritative application status is stored per application
- Ordered status history is created for each supported transition
- Student and company views consume the same lifecycle vocabulary
- Action-specific units reuse the shared status model
