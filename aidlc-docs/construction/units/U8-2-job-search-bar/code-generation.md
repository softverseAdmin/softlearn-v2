# Code generation: U8-2-job-search-bar

## Implementation plan

1. Add query parsing and visible-vacancy search behavior to the student jobs API.
2. Search only approved visible vacancy fields such as title, description, company name, and location.
3. Add the search bar UI to the student jobs page with clear/apply transitions.
4. Cover filtered-result and visibility behavior with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentJobsPage.tsx`
- `aidlc-docs/construction/units/U8-2-job-search-bar/code-generation.md`
- `aidlc-docs/construction/units/U8-2-job-search-bar/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the student jobs query parsing and search-bar UI.
- Restore the jobs page to the prior unfiltered visible vacancy list.

## Review checklist

- Search only runs against visible student-authorized vacancies
- Query state and no-match behavior remain stable
- Search works alongside later structured filters without redefining visibility rules
- The student jobs page exposes a clear apply and clear-search flow
