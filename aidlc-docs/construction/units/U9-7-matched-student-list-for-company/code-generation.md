# Code generation: U9-7-matched-student-list-for-company

## Implementation plan

1. Add a protected company vacancy matches API backed by the shared deterministic scorer.
2. Create and sync `CandidateReviewAccess` records for recommendation-quality students.
3. Render a company vacancy matches page with privacy-safe candidate details and candidate-review links.
4. Cover authorization, privacy shaping, and match-context creation with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/CompanyVacancyMatchesPage.tsx`
- `frontend/src/features/profile/CompanyVacanciesPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U9-7-matched-student-list-for-company/code-generation.md`
- `aidlc-docs/construction/units/U9-7-matched-student-list-for-company/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the company vacancy matches endpoint, UI route, match-context sync, and related tests.

## Review checklist

- Only company users can access vacancy match lists
- Candidate visibility honors privacy settings
- Match contexts are created only for recommendation-quality students
- Company vacancy pages link to matched-student review
