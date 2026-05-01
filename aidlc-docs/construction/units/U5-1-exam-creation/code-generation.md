# Code generation: U5-1-exam-creation

## Implementation plan

1. Keep exam authoring in protected admin routes with shared exam records.
2. Support create, update, and retire behavior plus exam-level attempt policy fields.
3. Reuse the shared exam records across student-taking and history flows.
4. Cover admin-only access with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/admin/types.ts`
- `frontend/src/features/admin/AdminExamsPage.tsx`
- `aidlc-docs/construction/units/U5-1-exam-creation/code-generation.md`
- `aidlc-docs/construction/units/U5-1-exam-creation/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert exam authoring changes, shared exam policy fields, and related tests.

## Review checklist

- Admin-only exam authoring is enforced
- Exam policy fields stay compatible with later student-taking flows
- Shared exam records remain the single source of truth

