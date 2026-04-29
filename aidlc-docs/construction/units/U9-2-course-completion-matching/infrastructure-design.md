# Infrastructure design: U9-2-course-completion-matching

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend evaluation behavior for deriving a structured course-completion-match factor consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for learning-match rule refinements

## External services

- None required for the baseline course-completion-matching flow
- External AI, recommendation, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected learning-factor evaluation using structured student learning evidence and vacancy context.
- Later AWS-compatible deployment should preserve the same deterministic explainability posture and protected student-data boundaries.
- Course-completion-matching behavior must remain compatible with later aggregate scoring and matched-view workflows.

## Database impact

- The baseline relies on structured learning summary data, **CourseCompletion** evidence, vacancy context, and later **MatchFactor** storage or equivalent factor output handling.
- Later aggregate scoring and matched-view units should consume the same learning-factor baseline rather than creating conflicting learning-fit models.
- The unit should not create aggregate match results or application records directly.
