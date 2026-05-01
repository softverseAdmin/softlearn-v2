# Code generation: U15-3-interview-notifications

## Implementation plan

1. Emit interview notifications from shared interview-event records.
2. Route each event to the student and company-side participant context using protected interview links.
3. Keep interview notification content summary-safe while reusing the shared delivery tracking model.
4. Cover interview request, confirmation, reschedule, and cancellation with backend tests.

## Files to create or update

- `backend/users/notifications.py`
- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/notifications/NotificationsPage.tsx`
- `aidlc-docs/construction/units/U15-3-interview-notifications/code-generation.md`
- `aidlc-docs/construction/units/U15-3-interview-notifications/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert interview notification emission and the related interview-notification assertions.

## Review checklist

- Interview lifecycle events create deterministic participant notifications
- Notification links return users to protected interview views
- Delivery tracking is preserved for in-app and simulated email channels
