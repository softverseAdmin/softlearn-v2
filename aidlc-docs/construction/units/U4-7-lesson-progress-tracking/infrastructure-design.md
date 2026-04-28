# Infrastructure design: U4-7-lesson-progress-tracking

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected lesson-progress persistence and retrieval behavior that later backend session-aware APIs and data storage must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for progress-model refinements

## External services

- None required for the baseline lesson-progress flow
- Analytics platforms, event streams, or recommendation engines are out of scope for this unit

## Deployment impact

- Local-first development must support protected lesson-progress reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same student-owned learning-state posture.
- Progress endpoints and routes must remain consistent with the shared student learning architecture.

## Database impact

- The baseline relies on structured **LessonProgress** records linked to **Enrollment** and **Lesson**.
- Later **CourseCompletion** records should derive from lesson-progress state rather than bypassing it.
- The unit should not create matching, readiness, or analytics records directly.
