# Code generation: U4-5-lesson-viewing

## Implementation plan

1. Add protected student lesson-detail APIs that only serve lessons from active courses after enrollment exists.
2. Return stable lesson navigation, content, and current progress state for the enrolled student.
3. Add a student lesson page and route wired from course detail.
4. Cover missing-course, missing-lesson, and unenrolled access outcomes with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentCourseDetailPage.tsx`
- `frontend/src/features/profile/StudentLessonPage.tsx`
- `frontend/src/router/AppRouter.tsx`
- `frontend/src/app/PageTitle.tsx`
- `aidlc-docs/construction/units/U4-5-lesson-viewing/code-generation.md`
- `aidlc-docs/construction/units/U4-5-lesson-viewing/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the protected lesson-detail API, lesson page, route wiring, and related tests.

## Review checklist

- Unenrolled students cannot open protected lessons
- Lesson detail uses stable previous and next navigation
- Only active-course, active-lesson content is exposed
- Loading, error, and empty-content states are covered
