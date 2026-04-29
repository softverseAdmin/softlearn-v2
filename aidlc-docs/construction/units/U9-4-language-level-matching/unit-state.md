# Unit: U9-4-language-level-matching

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline language-level-matching flow so the platform can compare student language levels to vacancy language requirements using deterministic, explainable rules without collapsing other match factors or overall match scoring into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, skill matching, exam-score matching, location matching, aggregate match-score calculation, and matched-list presentation.

## Dependencies

Depends on the requirements, security, data-model, architecture, rule-based matching strategy, student-profile-language-level, and vacancy-language-requirements baselines.

## Acceptance Criteria

The unit documents deterministic language-level matching, explainability boundaries, and relationship to later aggregate match-scoring and matched-view units without producing application code.

## Risks

If language-level matching is underspecified here, later aggregate match scoring and matched-list units can drift into conflicting language-threshold logic and non-explainable fit outcomes.

## Open Questions

Exact treatment of slight-under-threshold cases and multi-language combinations can be refined later as long as language-level matching remains deterministic and explainable.

## Last Updated

2026-04-29
