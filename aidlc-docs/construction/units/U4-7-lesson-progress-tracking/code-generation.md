# Code generation: U4-7-lesson-progress-tracking

## Implementation plan

1. Add a `LessonProgress` model linked to the enrolled course record and lesson.
2. Add protected student progress-update APIs for starting and completing lessons with deterministic transitions.
3. Surface lesson progress state in the student lesson page and course detail page.
4. Cover progress updates, invalid access, and progress-state persistence with backend tests.

## Files to create or update

- `backend/users/models.py`
- `backend/users/migrations/0017_lesson_lessonprogress.py`
- `backend/users/admin.py`
- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentLessonPage.tsx`
- `frontend/src/features/profile/StudentCourseDetailPage.tsx`
- `aidlc-docs/construction/units/U4-7-lesson-progress-tracking/code-generation.md`
- `aidlc-docs/construction/units/U4-7-lesson-progress-tracking/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert lesson progress models, progress APIs, lesson-page progress actions, and related tests.

## Review checklist

- Lesson progress belongs to exactly one course enrollment and one lesson
- Only valid start and completion transitions are accepted
- Progress updates stay student-owned and protected
- Lesson progress is reflected consistently across lesson and course surfaces
