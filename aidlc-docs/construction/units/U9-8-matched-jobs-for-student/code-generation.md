# Code generation: U9-8-matched-jobs-for-student

## Implementation plan

1. Add a protected student matches API backed by the shared deterministic scorer.
2. Return factor breakdowns, strengths, gaps, bookmark state, and active-application state per matched vacancy.
3. Render a student matched-jobs page and add route and navigation access.
4. Cover ranked ordering and visible-vacancy protection with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentMatchesPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U9-8-matched-jobs-for-student/code-generation.md`
- `aidlc-docs/construction/units/U9-8-matched-jobs-for-student/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the student matches endpoint, page, route, and related tests.

## Review checklist

- Only visible student-facing vacancies appear in matched jobs
- Bookmark and application state stay consistent with discovery flows
- Match factors and explanations are rendered clearly for students
- Student navigation exposes the matched-jobs experience
