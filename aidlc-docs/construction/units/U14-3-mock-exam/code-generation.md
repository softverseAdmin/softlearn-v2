# Code generation: U14-3-mock-exam

## Implementation plan

1. Reuse ready active exams as mock-exam templates.
2. Add separate `MockExamAttempt` and `MockExamAttemptAnswer` persistence.
3. Expose protected student mock-exam detail and submission routes.
4. Add a dedicated mock-exam page linked from the preparation workspace.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0019_preparation_workspace.py`
- `backend/users/admin.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentPreparationPage.tsx`
- `frontend/src/features/profile/StudentMockExamPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U14-3-mock-exam/code-generation.md`
- `aidlc-docs/construction/units/U14-3-mock-exam/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert mock-exam attempt tables, student mock routes, and the mock-exam UI.

## Review checklist

- Mock results never write to `ExamResult`
- Mock scoring is deterministic and explainable
- Mock history stays student-owned
