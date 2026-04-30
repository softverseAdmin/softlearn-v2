# Code generation: U10-3-withdraw-application

## Implementation plan

1. Add a protected student withdrawal endpoint for student-owned applications.
2. Restrict withdrawal to deterministic withdrawable states only.
3. Record withdrawn history events and reflect the result in the student applications page.
4. Deactivate application-based candidate review access when no active applications remain.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/StudentApplicationsPage.tsx`
- `frontend/src/features/profile/types.ts`
- `aidlc-docs/construction/units/U10-3-withdraw-application/code-generation.md`
- `aidlc-docs/construction/units/U10-3-withdraw-application/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the student withdrawal endpoint and page behavior.
- Restore the app to the prior state without student-driven withdrawal transitions.

## Review checklist

- Only the owning student can withdraw an application
- Withdrawal is blocked from non-withdrawable states
- Withdrawn history entries are recorded
- Student application tracking reflects the terminal withdrawn state
