# Unit: U7-1-vacancy-create

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline protected vacancy-creation flow so authorized company users can create structured vacancy records without collapsing editing, deletion, listing, detail, or requirement-tag behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, vacancy editing, vacancy deletion, vacancy listing or detail viewing, skill-tag management, language requirements, location settings, student job search, and matching behavior.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, routing, state-management, base-layout, company-profile-basic, company-profile-description, and company-hiring-preferences baselines.

## Acceptance Criteria

The unit documents protected vacancy creation, company ownership boundaries, validation outcomes, and relationship to later vacancy units without producing application code.

## Risks

If vacancy creation is underspecified here, later listing, detail, editing, matching, and application units can drift into conflicting vacancy identity, ownership, and publication expectations.

## Open Questions

Exact draft-versus-published lifecycle rules, moderation workflows, and richer vacancy metadata can be refined later as long as protected vacancy creation remains explicit and company-owned.

## Last Updated

2026-04-29
