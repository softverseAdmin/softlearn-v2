# Code generation: U15-5-email-notification-service

## Implementation plan

1. Reuse `NotificationDelivery` to create a simulated email delivery record whenever a notification is created.
2. Record summary-safe payload text for the email channel without calling external providers.
3. Keep email delivery backend-driven and auditable.
4. Cover simulated email delivery through notification-producing backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/notifications.py`
- `backend/api/tests.py`
- `aidlc-docs/construction/units/U15-5-email-notification-service/code-generation.md`
- `aidlc-docs/construction/units/U15-5-email-notification-service/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert simulated email-delivery record creation from the shared notification factory.

## Review checklist

- Email delivery remains simulated and backend-driven
- Payload summaries stay safe for logs and summaries
- Notification-producing workflows create matching delivery records
