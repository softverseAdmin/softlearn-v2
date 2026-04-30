# Unit: U7-7-vacancy-language-requirements

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement structured vacancy language requirements so authorized company users can attach stable language expectations and minimum levels to a vacancy through the protected vacancy-management flows.

## Out of Scope

Language-match scoring logic, student language assessment, and recommendation behavior beyond exposing structured vacancy expectations.

## Dependencies

Depends on the requirements, security, data-model, architecture, RBAC, API, vacancy-create, vacancy-edit, vacancy-list, and vacancy-detail baselines.

## Acceptance Criteria

Vacancies persist structured language requirements, and company/admin vacancy editors expose the same language contract consistently.

## Risks

Vacancy language requirements now feed student discovery and later matching inputs, so validation or serializer drift would create inconsistent language expectations across the product.

## Open Questions

Later units can add more languages or richer level mappings if they preserve the current explicit vacancy-linked language requirement model.

## Last Updated

2026-04-30
