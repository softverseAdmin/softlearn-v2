# Unit: U9-7-matched-student-list-for-company

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline company-facing matched-student-list flow so authorized company users can review ranked student recommendations for a vacancy using deterministic explainable match results under privacy and consent controls.

## Out of Scope

Concrete frontend/backend implementation code, aggregate score calculation logic, applications, interview scheduling, and any unauthorized student-data exposure.

## Dependencies

Depends on the requirements, security, data-model, architecture, company authorization baselines, privacy filter for results, vacancy-list/detail baselines, and U9-1 through U9-6 matching baselines.

## Acceptance Criteria

The unit documents company-facing matched-student-list behavior, privacy constraints, and relationship to upstream aggregate match scoring without producing application code.

## Risks

If company matched-student views are underspecified here, later implementation can expose protected student data, apply inconsistent ranking logic, or blur recommendation support into automated hiring decisions.

## Open Questions

Exact company UI sorting, pagination defaults, and recruiter action affordances can be refined later as long as visibility, explanation, and privacy rules remain deterministic.

## Last Updated

2026-04-29
