# Code generation: U4-8-course-completion-tracking

## Implementation plan

1. Derive course completion deterministically from active lesson progress under a course-linked learning record.
2. Synchronize course-level progress percent, status, and completion timestamp after lesson updates.
3. Surface completion state in course detail, learning summary, and student dashboard continuation CTAs.
4. Cover course completion rollup behavior with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/StudentLearningPage.tsx`
- `frontend/src/features/profile/StudentCourseCatalogPage.tsx`
- `frontend/src/features/profile/StudentCourseDetailPage.tsx`
- `aidlc-docs/construction/units/U4-8-course-completion-tracking/code-generation.md`
- `aidlc-docs/construction/units/U4-8-course-completion-tracking/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert the course-progress rollup logic, completion UI surfaces, and related tests.

## Review checklist

- Course completion is derived from lesson progress, not free-form writes
- Completion updates stay deterministic and repeatable
- Course-level progress remains aligned across dashboard, course detail, and learning summary
- Completion stays protected student learning data
