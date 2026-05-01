# Code generation: U15-4-exam-result-notifications

## Implementation plan

1. Emit official exam-result notifications from `ExamResult` creation and update events.
2. Route exam-result notifications only to the owning student.
3. Reuse the shared notification delivery model for in-app and simulated email channels.
4. Keep exam-result notifications separate from company-side result visibility rules.

## Files to create or update

- `backend/users/notifications.py`
- `backend/users/signals.py`
- `backend/api/tests.py`
- `aidlc-docs/construction/units/U15-4-exam-result-notifications/code-generation.md`
- `aidlc-docs/construction/units/U15-4-exam-result-notifications/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert exam-result notification signal handling and related notification assertions.

## Review checklist

- Official exam results create student-only notifications
- Notification content remains summary-safe
- Delivery records remain aligned with the notification core
