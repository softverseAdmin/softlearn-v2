# Code generation: U4-1-course-creation

## Implementation plan

1. Add a shared `Course` model so course creation uses reusable learning-domain records.
2. Add protected admin course creation and update APIs with deterministic validation.
3. Build an admin course management page that includes the creation flow.
4. Cover admin-only access and course CRUD behavior with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/admin.py`
- `backend/users/migrations/0015_course_learningrecord_course.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/admin/types.ts`
- `frontend/src/features/admin/AdminCoursesPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U4-1-course-creation/code-generation.md`
- `aidlc-docs/construction/units/U4-1-course-creation/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the shared course model, admin authoring APIs, admin course UI, and related tests.

## Review checklist

- Course creation is protected to admins
- Course validation is deterministic
- Shared course records are reusable by later learning units
- Authoring UI and API contracts stay aligned
