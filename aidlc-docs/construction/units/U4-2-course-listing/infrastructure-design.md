# Infrastructure design: U4-2-course-listing

## Infrastructure impact

This unit does not provision infrastructure, but it defines course-listing discovery behavior that later backend runtime and frontend delivery must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags if catalog visibility or browsing posture is refined later

## External services

- None required for the baseline course-listing flow
- Search, recommendation, or CDN optimization services are out of scope for this unit

## Deployment impact

- Local-first development must support course-list reads between frontend and backend.
- Later AWS-compatible deployment should preserve the same course-listing behavior without changing the unit definition.
- Listing pages must remain compatible with the shared routing and frontend delivery model.

## Database impact

- The baseline relies on structured **Course** records, with later related **Lesson**, **Enrollment**, **LessonProgress**, and **CourseCompletion** records extending the learning domain.
- This unit should remain read-focused on course listing rather than creating student-owned learning state directly.
