# Unit: U9-2-course-completion-matching

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Use completed and in-progress learning records as deterministic readiness evidence inside the matching pipeline.

## Out of Scope

Adaptive learning recommendations, course difficulty normalization, and personalized AI tutoring signals.

## Dependencies

Depends on the learning-summary baseline, rule-based matching strategy, and match-score-calculation unit.

## Acceptance Criteria

Completed and in-progress learning records contribute predictably to readiness scoring and to the strengths and gaps returned by the match APIs.

## Risks

If learning progress is over-weighted, early coursework could outrank stronger skill or language alignment.

## Open Questions

Course-category-specific weighting can be added later if it remains deterministic and explainable.

## Last Updated

2026-04-30
