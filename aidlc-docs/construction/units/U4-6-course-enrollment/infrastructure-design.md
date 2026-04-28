# Infrastructure design: U4-6-course-enrollment

## Infrastructure impact

This unit does not provision infrastructure, but it defines enrollment creation and read behavior that later backend session-aware APIs, authorization checks, and persistence layers must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for enrollment policy refinements

## External services

- None required for the baseline course-enrollment flow
- Billing, commerce, or waitlist services are out of scope for this unit

## Deployment impact

- Local-first development must support session-protected enrollment reads and writes between frontend and backend.
- Later AWS-compatible deployment should preserve the same student-owned enrollment posture.
- Enrollment routes and APIs must remain compatible with the shared student learning architecture.

## Database impact

- The baseline relies on structured **Enrollment** records linking a **StudentProfile** to a **Course**.
- Later **LessonProgress** and **CourseCompletion** records should extend this student-course relationship rather than replace it.
- The unit should not create lesson-progress or course-completion state directly.
