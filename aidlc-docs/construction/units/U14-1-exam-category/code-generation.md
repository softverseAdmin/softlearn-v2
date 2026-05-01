# Code generation: U14-1-exam-category

## Implementation plan

1. Reuse the shared `Exam.category` field as the stable preparation category source.
2. Add a protected preparation summary API that groups practice, mock, and study-plan evidence by category.
3. Surface category cards in a new student preparation workspace.
4. Keep category summaries separate from official exam pass/fail history.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0019_preparation_workspace.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentPreparationPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U14-1-exam-category/code-generation.md`
- `aidlc-docs/construction/units/U14-1-exam-category/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the preparation summary routes, category serialization, and related student UI.

## Review checklist

- Category grouping is driven by stable exam metadata
- Category summaries stay student-owned and deterministic
- Official exam results are not rewritten by preparation category features
