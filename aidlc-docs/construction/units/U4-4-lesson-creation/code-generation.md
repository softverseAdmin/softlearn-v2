# Code generation: U4-4-lesson-creation

## Implementation plan

1. Add a shared `Lesson` model linked to `Course` with ordered sequence and protected authoring validation.
2. Add admin lesson management APIs under course context plus retire behavior for existing lessons.
3. Add an admin lesson-management page linked from course management so operators can create and maintain ordered lessons.
4. Cover lesson authoring and retirement behavior with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0017_lesson_lessonprogress.py`
- `backend/users/admin.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/admin/types.ts`
- `frontend/src/features/admin/AdminCoursesPage.tsx`
- `frontend/src/features/admin/AdminCourseLessonsPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U4-4-lesson-creation/code-generation.md`
- `aidlc-docs/construction/units/U4-4-lesson-creation/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the lesson model, admin lesson endpoints, admin lesson page, and related tests.

## Review checklist

- Lessons are course-scoped and sequence-ordered
- Admin-only lesson authoring is enforced
- Duplicate or invalid sequence values are rejected
- Lesson retirement preserves existing records instead of deleting them
