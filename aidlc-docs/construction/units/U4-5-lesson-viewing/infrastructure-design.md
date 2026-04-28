# Infrastructure design: U4-5-lesson-viewing

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected lesson-delivery behavior that later backend content reads, authorization checks, and frontend routes must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for lesson-preview or navigation refinements

## External services

- None required for the baseline lesson-viewing flow
- Video streaming, CDN optimization, or third-party content-delivery services are out of scope for this unit

## Deployment impact

- Local-first development must support protected lesson-content reads between frontend and backend.
- Later AWS-compatible deployment should preserve the same authorized lesson-access posture.
- Student lesson-viewing routes must remain distinct from protected authoring routes.

## Database impact

- The baseline relies on structured **Lesson** records linked to a **Course**.
- The unit may read authorization-relevant learning context, but it should not create **Enrollment**, **LessonProgress**, or **CourseCompletion** records by itself.
