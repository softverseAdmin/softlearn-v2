# Unit: U7-3-vacancy-delete

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline protected vacancy-delete flow so authorized company users can remove or retire their own vacancy records without collapsing creation, editing, listing, detail, or requirement-tag behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, vacancy creation, vacancy editing, vacancy listing or detail viewing, skill-tag management, language requirements, location settings, student job search, and matching behavior.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, routing, base-layout, and vacancy-create and vacancy-edit baselines.

## Acceptance Criteria

The unit documents protected vacancy deletion, company ownership boundaries, stable removal outcomes, and relationship to later vacancy units without producing application code.

## Risks

If vacancy deletion is underspecified here, later listing, detail, application, and matching units can drift into conflicting assumptions about withdrawn, hidden, or removed vacancies.

## Open Questions

Exact soft-delete versus archive behavior, recovery windows, and applicant-notification policy can be refined later as long as protected company-owned vacancy removal remains explicit and auditable.

## Last Updated

2026-04-29
