# Unit: U9-6-match-score-calculation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement the shared deterministic aggregate match score, recommendation threshold, factor breakdown payload, and human-readable match-level labels.

## Out of Scope

Machine-learned ranking, adaptive weighting, and opaque recommendation heuristics.

## Dependencies

Depends on the skill, course-completion, exam-score, language-level, and location-preference matching units.

## Acceptance Criteria

Student and company match endpoints share one aggregate scorer, expose factor breakdowns, and return stable match-level labels derived from explicit thresholds.

## Risks

If aggregation logic diverges between endpoints, recommendation counts and ordering will become inconsistent and unauditable.

## Open Questions

Threshold and weight tuning can evolve later if updates remain explicit, deterministic, and documented.

## Last Updated

2026-04-30
