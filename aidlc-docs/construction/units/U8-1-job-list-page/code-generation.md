# Code generation: U8-1-job-list-page

## Implementation plan

1. Add a student-facing vacancy list API that returns only active vacancies from active companies.
2. Add backend tests for visibility filtering and student-only access.
3. Add a protected student jobs page, route, navigation entry, and title mapping.
4. Keep the implementation list-only, without search, filters, bookmarks, applications, or matching behavior.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/StudentJobsPage.tsx`
- `frontend/src/features/profile/types.ts`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `aidlc-docs/construction/units/U8-1-job-list-page/code-generation.md`
- `aidlc-docs/construction/units/U8-1-job-list-page/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the student jobs API, page, route, navigation, and document updates.
- Restore the app to the prior state without a student-facing vacancy browsing surface.

## Review checklist

- Student route exposes a stable visible vacancy list
- Only active vacancies from active companies are returned
- Student UI handles loading, empty, and populated list states
- Search, filters, bookmarks, applications, and matching remain out of scope
