# Code generation: U5-4-exam-taking-ui

## Implementation plan

1. Add protected student exam-detail APIs that return only active exam, question, and option data.
2. Add a student exam-taking page with local answer state and explicit submission.
3. Surface available exams from the student exam history page with attempt eligibility context.
4. Cover protected exam access with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentExamResultsPage.tsx`
- `frontend/src/features/profile/StudentExamPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U5-4-exam-taking-ui/code-generation.md`
- `aidlc-docs/construction/units/U5-4-exam-taking-ui/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert protected student exam routes, exam-taking UI, and related tests.

## Review checklist

- Students see only presentation-safe exam data
- Unavailable or ineligible exams return stable outcomes
- Exam-taking state stays local until submission

