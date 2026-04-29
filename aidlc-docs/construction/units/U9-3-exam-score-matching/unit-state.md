# Unit: U9-3-exam-score-matching

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline exam-score-matching flow so the platform can compare protected student exam evidence to vacancy context using deterministic, explainable rules without collapsing other match factors or overall match scoring into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, language matching, course-completion matching, location matching, aggregate match-score calculation, and matched-list presentation.

## Dependencies

Depends on the requirements, security, data-model, architecture, rule-based matching strategy, exam-results summary, exam history, and readiness baselines.

## Acceptance Criteria

The unit documents deterministic exam-score matching, explainability boundaries, and relationship to later aggregate match-scoring and matched-view units without producing application code.

## Risks

If exam-score matching is underspecified here, later aggregate match scoring and matched-list units can drift into conflicting exam-evidence relevance rules and non-explainable assessment-fit outcomes.

## Open Questions

Exact relevance mapping between exam evidence and vacancy context can be refined later as long as exam-score matching remains deterministic and explainable.

## Last Updated

2026-04-29
