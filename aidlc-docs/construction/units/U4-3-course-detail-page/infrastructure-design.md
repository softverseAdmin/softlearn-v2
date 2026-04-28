# Infrastructure design: U4-3-course-detail-page

## Infrastructure impact

This unit does not provision infrastructure, but it defines single-course detail behavior that later backend reads, frontend routing, and page delivery must support consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for access-model or rich-detail refinements

## External services

- None required for the baseline course-detail flow
- Recommendation engines, search indexing, or media-delivery optimization are out of scope for this unit

## Deployment impact

- Local-first development must support detail reads between frontend and backend.
- Later AWS-compatible deployment should preserve the same route and detail behavior without changing the unit definition.
- Detail pages must remain compatible with the shared student-facing routing model.

## Database impact

- The baseline relies on structured **Course** records and may surface related summary information derived from associated **Lesson** records.
- The unit should remain read-focused and must not create **Enrollment**, **LessonProgress**, or **CourseCompletion** records.
