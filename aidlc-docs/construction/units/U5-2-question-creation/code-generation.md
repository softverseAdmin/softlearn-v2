# Code generation: U5-2-question-creation

## Implementation plan

1. Add an `ExamQuestion` model with ordering, points, and protected authoring validation.
2. Add admin question-management APIs scoped under an existing exam.
3. Add an admin question-management page linked from exam management.
4. Cover protected question authoring and exam question-count synchronization with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0018_exam_questions_attempts.py`
- `backend/users/admin.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/admin/types.ts`
- `frontend/src/features/admin/AdminExamQuestionsPage.tsx`
- `frontend/src/features/admin/AdminExamsPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U5-2-question-creation/code-generation.md`
- `aidlc-docs/construction/units/U5-2-question-creation/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert question models, admin question APIs, question-management UI, and related tests.

## Review checklist

- Questions are exam-scoped and sequence-ordered
- Protected question authoring is enforced
- Exam question counts stay synchronized with active questions

