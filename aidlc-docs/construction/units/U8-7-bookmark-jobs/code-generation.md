# Code generation: U8-7-bookmark-jobs

## Implementation plan

1. Add protected student-owned job bookmark persistence linked to visible vacancies.
2. Add bookmark and unbookmark API actions that preserve vacancy visibility rules.
3. Expose bookmark state in the student jobs API and render save/remove controls in the jobs page.
4. Cover ownership and visibility protection with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/admin.py`
- `backend/users/migrations/0014_vacancy_metadata_and_bookmarks.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentJobsPage.tsx`
- `aidlc-docs/construction/units/U8-7-bookmark-jobs/code-generation.md`
- `aidlc-docs/construction/units/U8-7-bookmark-jobs/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the bookmark model, API actions, and jobs-page bookmark controls.
- Restore student discovery to the prior non-bookmarking state.

## Review checklist

- Bookmark ownership is strictly student-owned
- Bookmark creation respects visible-job eligibility
- Bookmark state is exposed consistently in the jobs API and UI
- Bookmarking stays separate from application submission behavior
