# Code generation: U14-2-practice-question-bank

## Implementation plan

1. Reuse active exam questions and options as a protected practice-question source.
2. Add a student practice-question API with category and exam filters.
3. Record `PracticeQuestionAttempt` evidence separately from official `ExamResult` records.
4. Return immediate deterministic correctness feedback only after the student submits a practice answer.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0019_preparation_workspace.py`
- `backend/users/admin.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentPreparationPage.tsx`
- `aidlc-docs/construction/units/U14-2-practice-question-bank/code-generation.md`
- `aidlc-docs/construction/units/U14-2-practice-question-bank/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert practice-question attempt persistence, student practice routes, and related UI.

## Review checklist

- Practice attempts stay separate from official exam results
- Practice filters stay category- and exam-based
- Feedback is deterministic and revealed only after submission
