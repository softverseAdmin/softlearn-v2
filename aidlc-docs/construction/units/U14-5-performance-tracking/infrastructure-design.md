# Infrastructure design: U14-5-performance-tracking

## Infrastructure impact

This unit does not provision new infrastructure, but it defines the baseline performance tracking path that later implementation must support within the existing local-first, AWS-compatible direction.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for student-preparation refinements

## External services

- None required for the baseline student-preparation flow
- External tutoring or AI study services are out of scope for this unit

## Deployment impact

- Local-first development must support the protected workflow defined in this unit.
- Later AWS-compatible deployment should preserve the same authorization, privacy, audit, and deterministic behavior.
- Adjacent units must integrate with this baseline without redefining its core responsibilities.

## Database impact

- The baseline relies on protected use of **PracticeSession**, **MockExamResult**, **StudyPlan**, and **PreparationPerformanceSummary** or equivalent records.
- Stored records should remain traceably linked to actor, workflow context, and audit history where applicable.
- The unit should not create unrelated records or schema expectations outside its narrow scope.
