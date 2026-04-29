# Unit: U9-5-location-preference-matching

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline location-preference-matching flow so the platform can compare student location preferences to vacancy location and work-style settings using deterministic, explainable rules without collapsing other match factors or overall match scoring into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, skill matching, exam-score matching, language matching, aggregate match-score calculation, and matched-list presentation.

## Dependencies

Depends on the requirements, security, data-model, architecture, rule-based matching strategy, student-profile-basic, student-availability-management, and vacancy-location-settings baselines.

## Acceptance Criteria

The unit documents deterministic location-preference matching, explainability boundaries, and relationship to later aggregate match-scoring and matched-view units without producing application code.

## Risks

If location-preference matching is underspecified here, later aggregate match scoring and matched-list units can drift into conflicting location-fit logic and non-explainable work-style outcomes.

## Open Questions

Exact remote, hybrid, relocation, and flexible-preference rules can be refined later as long as location-preference matching remains deterministic and explainable.

## Last Updated

2026-04-29
