# Code generation: U15-1-notification-core

## Implementation plan

1. Reuse the shared `Notification` and `NotificationDelivery` models for all user-facing events.
2. Keep notification creation backend-driven with deterministic event keys.
3. Expose protected notification list and read-state APIs to all authenticated roles.
4. Preserve summary-safe in-app and simulated email delivery records per notification.

## Files to create or update

- `backend/users/models.py`
- `backend/users/notifications.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/notifications/NotificationsPage.tsx`
- `frontend/src/features/notifications/types.ts`
- `aidlc-docs/construction/units/U15-1-notification-core/code-generation.md`
- `aidlc-docs/construction/units/U15-1-notification-core/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert notification-core model usage, protected notification APIs, and the shared notifications UI.

## Review checklist

- Notification records use deterministic event keys
- Only recipients can view and update their notifications
- Delivery records stay summary-safe and auditable
