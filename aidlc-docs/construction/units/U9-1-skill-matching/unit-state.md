# Unit: U9-1-skill-matching

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline skill-matching flow so the platform can compare student skills to vacancy skill requirements using deterministic, explainable rules without collapsing other match factors or overall match scoring into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, language matching, course-completion matching, exam-score matching, location matching, aggregate match-score calculation, and matched-list presentation.

## Dependencies

Depends on the requirements, security, data-model, architecture, rule-based matching strategy, student-profile-skills, vacancy-skill-tags, and readiness baselines.

## Acceptance Criteria

The unit documents deterministic skill-matching behavior, explainability boundaries, and relationship to later aggregate match-scoring and matched-view units without producing application code.

## Risks

If skill matching is underspecified here, later aggregate match scoring and matched-list units can drift into conflicting required-versus-preferred skill logic and non-explainable candidate fit outcomes.

## Open Questions

Exact partial-credit behavior, skill equivalence rules, and taxonomy synonym handling can be refined later as long as structured skill matching remains deterministic and explainable.

## Last Updated

2026-04-29
