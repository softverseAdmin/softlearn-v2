# Unit: U7-8-vacancy-location-settings

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement structured vacancy location settings so authorized company users can manage location, work style, and relocation-support posture as part of protected vacancy authoring.

## Out of Scope

Location matching logic, map integrations, and multi-region optimization beyond the structured location/work-style metadata now stored on vacancies.

## Dependencies

Depends on the requirements, security, data-model, architecture, RBAC, API, vacancy-create, vacancy-edit, vacancy-list, and vacancy-detail baselines.

## Acceptance Criteria

Vacancies persist structured location settings including work style and relocation support, and company/admin vacancy editors expose the same contract consistently.

## Risks

Location settings now feed student discovery filters, so inconsistent work-style or relocation handling would create confusing discovery behavior and weak matching inputs.

## Open Questions

Later units can add multi-region or relocation-detail semantics if they preserve the current explicit location/work-style contract.

## Last Updated

2026-04-30
