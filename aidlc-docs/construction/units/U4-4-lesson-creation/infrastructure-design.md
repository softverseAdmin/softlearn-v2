# Infrastructure design: U4-4-lesson-creation

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected lesson-authoring behavior that later backend runtime, authoring routes, and persistence layers must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for lesson-authoring workflow refinements

## External services

- None required for the baseline lesson-creation flow
- External media processing, CMS integration, or asset pipelines are out of scope for this unit

## Deployment impact

- Local-first development must support protected lesson-creation requests between frontend and backend.
- Later AWS-compatible deployment should preserve the same privileged authoring posture.
- Protected lesson-authoring routes must remain separate from student-facing lesson-viewing routes.

## Database impact

- The baseline relies on structured **Lesson** records linked to a parent **Course**.
- The unit should not create **Enrollment**, **LessonProgress**, or **CourseCompletion** records.
- Later lesson-viewing units will read the lesson data created here rather than redefining lesson structure.
