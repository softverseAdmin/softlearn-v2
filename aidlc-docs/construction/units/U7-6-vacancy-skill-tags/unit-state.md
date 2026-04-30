# Unit: U7-6-vacancy-skill-tags

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement structured vacancy skill tags so authorized company users can attach required and preferred shared-taxonomy skills to a vacancy through the protected vacancy-management flows.

## Out of Scope

Match scoring logic, recommendation behavior, and student-owned skill profiling beyond consuming the shared taxonomy already present in the app.

## Dependencies

Depends on the requirements, security, data-model, architecture, RBAC, API, vacancy-create, vacancy-edit, vacancy-list, and vacancy-detail baselines.

## Acceptance Criteria

Vacancies persist structured required and preferred skill requirements, and company/admin vacancy editors expose the same skill-tagging contract consistently.

## Risks

Vacancy skill tags now feed student discovery and later matching inputs, so serializer or validation drift would create inconsistent search and matching foundations.

## Open Questions

Later units can add richer proficiency or weighting semantics if they preserve the current vacancy-linked required/preferred taxonomy model.

## Last Updated

2026-04-30
