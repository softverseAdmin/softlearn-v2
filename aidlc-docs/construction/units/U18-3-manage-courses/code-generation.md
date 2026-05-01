# Code generation: U18-3-manage-courses

## Implementation plan

1. Add a shared `Course` domain model so admin course management uses reusable learning records instead of a management-only artifact.
2. Add protected admin course CRUD APIs with deterministic validation and soft-retire behavior.
3. Build an admin courses page with create, update, and deactivate workflows.
4. Cover admin access control, CRUD behavior, and course-linked learning summary behavior with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/admin.py`
- `backend/users/migrations/0015_course_learningrecord_course.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/admin/types.ts`
- `frontend/src/features/admin/AdminCoursesPage.tsx`
- `frontend/src/features/profile/types.ts`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/router/navigation.ts`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U18-3-manage-courses/code-generation.md`
- `aidlc-docs/construction/units/U18-3-manage-courses/unit-state.md`

## Test plan

- `. .venv\Scripts\Activate.ps1; cd backend; python manage.py check; python manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the shared course model, admin course APIs, admin course page, and related tests.
- Restore learning records to the prior standalone title/category behavior if the course-domain direction is rejected.

## Review checklist

- Course management is admin-only
- Shared course records are reusable by learning flows
- Course updates and retire actions are deterministic
- Admin UI and API contracts stay aligned
