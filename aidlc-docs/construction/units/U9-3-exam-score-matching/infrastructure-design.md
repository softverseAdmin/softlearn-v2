# Infrastructure design: U9-3-exam-score-matching

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend evaluation behavior for deriving a structured exam-score-match factor consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for exam-matching rule refinements

## External services

- None required for the baseline exam-score-matching flow
- External AI, recommendation, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected exam-factor evaluation using structured student assessment evidence and vacancy context.
- Later AWS-compatible deployment should preserve the same deterministic explainability posture and protected student-data boundaries.
- Exam-score-matching behavior must remain compatible with later aggregate scoring and matched-view workflows.

## Database impact

- The baseline relies on structured exam summary data, score and pass/fail evidence, vacancy context, and later **MatchFactor** storage or equivalent factor output handling.
- Later aggregate scoring and matched-view units should consume the same exam-factor baseline rather than creating conflicting exam-fit models.
- The unit should not create aggregate match results or application records directly.
