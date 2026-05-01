# Code generation: U5-5-answer-submission

## Implementation plan

1. Add `ExamAttempt` and `ExamAttemptAnswer` models for durable student-owned submission records.
2. Add a protected student submission API that validates question and option identities before finalizing answers.
3. Return a stable scored attempt result after controlled submission.
4. Cover submission ownership and validation with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0018_exam_questions_attempts.py`
- `backend/users/admin.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentExamPage.tsx`
- `aidlc-docs/construction/units/U5-5-answer-submission/code-generation.md`
- `aidlc-docs/construction/units/U5-5-answer-submission/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert exam attempt models, protected submission API, and related tests.

## Review checklist

- Submission records are student-owned and traceable
- All active questions must be answered before submission
- Invalid question or option references are rejected

