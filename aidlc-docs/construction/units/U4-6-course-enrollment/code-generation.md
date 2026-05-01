# Code generation: U4-6-course-enrollment

## Implementation plan

1. Use the shared course-linked `LearningRecord` as the student-owned enrollment record for active courses.
2. Add a protected student enrollment API from course detail with stable duplicate-enrollment behavior.
3. Surface enrollment state and CTA behavior in the course catalog and course detail pages.
4. Cover creation, duplicate enrollment, and student-only access with backend tests.

## Files to create or update

- `backend/api/views.py`
- `backend/api/urls.py`
- `backend/api/tests.py`
- `frontend/src/features/profile/types.ts`
- `frontend/src/features/profile/StudentCourseCatalogPage.tsx`
- `frontend/src/features/profile/StudentCourseDetailPage.tsx`
- `aidlc-docs/construction/units/U4-6-course-enrollment/code-generation.md`
- `aidlc-docs/construction/units/U4-6-course-enrollment/unit-state.md`

## Test plan

- `.venv\Scripts\python.exe manage.py check`
- `.venv\Scripts\python.exe manage.py test`
- `cd frontend; npm run build; npm run lint`
- `bash ./scripts/aidlc-check.sh` in a shell that can execute the repository validation script.

## Rollback plan

- Revert student enrollment APIs, course enrollment UI, and related tests.

## Review checklist

- Enrollment is student-owned and course-scoped
- Duplicate enrollment does not create conflicting records
- Enrollment state is reflected in course catalog and detail flows
- Company and admin users cannot use the student enrollment route
