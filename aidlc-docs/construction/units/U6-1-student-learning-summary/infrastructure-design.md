# Infrastructure design: U6-1-student-learning-summary

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected frontend and backend interaction expectations for returning student-owned learning summaries consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for learning-summary experience refinements

## External services

- None required for the baseline student learning-summary flow
- Analytics, notification, and external reporting services are out of scope for this unit

## Deployment impact

- Local-first development must support protected learning-summary reads between frontend and backend.
- Later AWS-compatible deployment should preserve the same student-ownership posture, privacy expectations, and protected summary-access behavior.
- Learning-summary behavior must remain compatible with later visibility-sensitive and readiness-sensitive workflows.

## Database impact

- The baseline relies on structured **Enrollment**, **LessonProgress**, and **CourseCompletion** data tied to the student and course context.
- Later visibility, readiness, and results features should consume the same learning-summary evidence rather than inventing parallel learning-summary models.
- The unit should not create company-visibility or readiness-score records directly.
