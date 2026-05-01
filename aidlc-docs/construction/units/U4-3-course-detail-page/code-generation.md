# Code generation: U4-3-course-detail-page

## Implementation plan

1. Add a protected student single-course detail API backed by the shared `Course` record.
2. Return meaningful course detail fields, learning outcomes, and stable unavailable behavior for missing or inactive courses.
3. Build a student course detail page with onward links toward the current learning area.
4. Cover stable detail access behavior with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentCourseDetailPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U4-3-course-detail-page/code-generation.md`
- `aidlc-docs/construction/units/U4-3-course-detail-page/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the student course detail API, course detail page, route wiring, and related tests.

## Review checklist

- Detail data stays course-centered
- Missing or inactive courses return stable not-found behavior
- Navigation from listing to detail works consistently
- Detail page stays separate from enrollment and lesson delivery logic
