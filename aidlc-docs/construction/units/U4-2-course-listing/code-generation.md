# Code generation: U4-2-course-listing

## Implementation plan

1. Add a protected student course catalog API that returns active shared course records.
2. Return meaningful course summary data and readiness cues without collapsing detail or progress behavior into the listing.
3. Build a student course catalog page and route in the learning area.
4. Cover active-course visibility and student-only access with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentCourseCatalogPage.tsx`
- `frontend/src/features/profile/StudentLearningPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `aidlc-docs/construction/units/U4-2-course-listing/code-generation.md`
- `aidlc-docs/construction/units/U4-2-course-listing/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the student course catalog API, course catalog page, route wiring, and related tests.

## Review checklist

- Only active courses are listed
- Listing stays separate from detail and enrollment logic
- Student routing and learning-area navigation stay aligned
- Empty, loading, and error states are covered
