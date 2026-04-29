# Infrastructure design: U11-2-view-student-learning-record

## Infrastructure impact

This unit does not provision new infrastructure, but it defines the baseline view student learning record path that later implementation must support within the existing local-first, AWS-compatible direction.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for company candidate-review refinements

## External services

- None required for the baseline company candidate-review flow
- External AI or third-party review services are out of scope for this unit

## Deployment impact

- Local-first development must support the protected workflow defined in this unit.
- Later AWS-compatible deployment should preserve the same authorization, privacy, audit, and deterministic behavior.
- Adjacent units must integrate with this baseline without redefining its core responsibilities.

## Database impact

- The baseline relies on protected use of **CourseEnrollment**, **LessonProgress**, **CourseCompletion**, and **FilteredLearningSummary** or equivalent records.
- Stored records should remain traceably linked to actor, workflow context, and audit history where applicable.
- The unit should not create unrelated records or schema expectations outside its narrow scope.
