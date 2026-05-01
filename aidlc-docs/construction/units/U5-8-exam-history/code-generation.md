# Code generation: U5-8-exam-history

## Implementation plan

1. Extend the protected student exam summary API to return available exams plus attempt history.
2. Keep the student exam page focused on the authenticated student’s own results and attempt context.
3. Preserve compatibility with the existing `ExamResult` summary view while linking new attempt records.
4. Cover protected exam history behavior with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentExamResultsPage.tsx`
- `aidlc-docs/construction/units/U5-8-exam-history/code-generation.md`
- `aidlc-docs/construction/units/U5-8-exam-history/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert protected exam-history API and UI changes.

## Review checklist

- Students can only see their own exam history
- Available exams and prior results are shown together coherently
- History remains privacy-safe and result-focused

