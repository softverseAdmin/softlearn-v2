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

Define the baseline match-score-calculation flow so the platform can aggregate deterministic factor outcomes into a stable explainable overall match result without collapsing matched-list presentation into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, matched-student presentation, matched-job presentation, applications, and any ML or LLM-based ranking.

## Dependencies

Depends on the requirements, security, data-model, architecture, rule-based matching strategy, readiness-score-calculation, student-profile baselines, and U9-1 through U9-5 factor baselines.

## Acceptance Criteria

The unit documents deterministic aggregate match-score calculation, explainability boundaries, and relationship to later matched-list units without producing application code.

## Risks

If aggregate match scoring is underspecified here, later matched-list units can drift into conflicting weights, opaque ranking logic, and non-auditable recommendation behavior.

## Open Questions

Exact score-band tuning, tie-break refinements, and profile-completeness input details can be refined later as long as aggregate match scoring remains deterministic and explainable.

## Last Updated

2026-04-29
