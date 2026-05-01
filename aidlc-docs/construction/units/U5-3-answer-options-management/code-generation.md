# Code generation: U5-3-answer-options-management

## Implementation plan

1. Add an `ExamAnswerOption` model linked to exam questions with ordering and protected correctness metadata.
2. Add admin APIs for creating, updating, and retiring options under a question.
3. Manage answer options from the admin question page without exposing correctness data to student flows.
4. Cover option authoring behavior with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0018_exam_questions_attempts.py`
- `backend/users/admin.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/admin/types.ts`
- `frontend/src/features/admin/AdminExamQuestionsPage.tsx`
- `aidlc-docs/construction/units/U5-3-answer-options-management/code-generation.md`
- `aidlc-docs/construction/units\U5-3-answer-options-management\unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert answer-option models, protected admin option APIs, option-management UI, and related tests.

## Review checklist

- Correctness metadata stays admin-only
- Options are question-scoped and sequence-ordered
- Invalid or duplicate option definitions are rejected

