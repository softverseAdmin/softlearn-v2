# Infrastructure design: U4-1-course-creation

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected course-authoring behavior that later backend runtime, admin routing, and persistence layers must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for draft or publication workflow refinement

## External services

- None required for the baseline course-creation flow
- External CMS, media pipeline, or publishing services are out of scope for this unit

## Deployment impact

- Local-first development must support protected course-creation requests between frontend and backend.
- Later AWS-compatible deployment should preserve the same privileged authoring posture without changing the unit definition.
- Admin or protected management routes must remain separate from student-facing learning routes.

## Database impact

- The baseline relies on structured **Course** records as the source for later listing and detail views.
- The unit should not create **Enrollment**, **LessonProgress**, or **CourseCompletion** records.
- Later lesson units will extend the course record through related **Lesson** data rather than altering the creation baseline.
