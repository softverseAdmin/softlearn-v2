# Code generation: U15-2-application-notifications

## Implementation plan

1. Add application-specific notification types to the shared notification model.
2. Emit notifications from `ApplicationStatusHistory` creation so submission, withdrawal, shortlist, and rejection use the same auditable event source.
3. Route application notifications to the owning student and active company users for the relevant company context.
4. Reuse the existing in-app and simulated email delivery posture.

## Files to create or update

- `backend/users/models.py`
- `backend/users/notifications.py`
- `backend/users/signals.py`
- `backend/api/tests.py`
- `frontend/src/features/notifications/NotificationsPage.tsx`
- `aidlc-docs/construction/units/U15-2-application-notifications/code-generation.md`
- `aidlc-docs/construction/units/U15-2-application-notifications/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert application notification types, application-history signal handling, and related notification assertions.

## Review checklist

- Submission, withdrawal, shortlist, and rejection create deterministic notifications
- Recipient routing stays inside the student/company application context
- Application notifications reuse the shared delivery tracking model
