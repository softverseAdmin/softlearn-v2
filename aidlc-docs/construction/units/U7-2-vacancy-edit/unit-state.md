# Unit: U7-2-vacancy-edit

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline protected vacancy-edit flow so authorized company users can update their own structured vacancy records without collapsing creation, deletion, listing, detail, or requirement-tag behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, vacancy creation, vacancy deletion, vacancy listing or detail viewing, skill-tag management, language requirements, location settings, student job search, and matching behavior.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, routing, state-management, base-layout, company-hiring-preferences, and vacancy-create baselines.

## Acceptance Criteria

The unit documents protected vacancy editing, company ownership boundaries, validation outcomes, and relationship to later vacancy units without producing application code.

## Risks

If vacancy editing is underspecified here, later detail, listing, search, and application units can drift into conflicting update rules, publication states, and ownership expectations.

## Open Questions

Exact revision history, draft-versus-published edit constraints, and moderation workflows can be refined later as long as protected company-owned vacancy editing remains explicit and auditable.

## Last Updated

2026-04-29
