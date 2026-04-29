# Infrastructure design: U9-6-match-score-calculation

## Infrastructure impact

This unit does not provision infrastructure, but it defines protected backend evaluation behavior for deriving an aggregate match result consistently.

## Environment variables

- Backend API base URL
- Frontend environment mode settings
- Optional future feature flags for weighting and ranking refinements

## External services

- None required for the baseline match-score-calculation flow
- External AI, ranking, and analytics services are out of scope for this unit

## Deployment impact

- Local-first development must support protected aggregate evaluation using structured factor outputs and student profile-completeness signals.
- Later AWS-compatible deployment should preserve the same deterministic explainability posture, auditability expectations, and protected student-data boundaries.
- Aggregate match-score behavior must remain compatible with later matched-view workflows.

## Database impact

- The baseline relies on structured factor outputs plus later **MatchResult** and **MatchFactor** storage or equivalent aggregate-result handling.
- Later matched-view units should consume the same aggregate-result baseline rather than creating conflicting scoring models.
- The unit should not create application, shortlist, or interview records directly.
