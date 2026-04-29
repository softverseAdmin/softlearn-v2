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

Define the baseline vacancy-location-settings flow so authorized company users can attach structured location and work-style expectations to an existing vacancy without collapsing skill tags, language requirements, or matching behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, vacancy CRUD behavior, skill tags, language requirements, student search filters, applications, and matching calculation.

## Dependencies

Depends on the requirements, security, data-model, architecture, RBAC, API, vacancy-create, vacancy-edit, vacancy-list, and vacancy-detail baselines.

## Acceptance Criteria

The unit documents structured vacancy location settings, company ownership boundaries, and relationship to later search and matching units without producing application code.

## Risks

If vacancy location settings are underspecified here, later search, matching, and candidate-review units can drift into conflicting location, remote, and work-style requirement definitions.

## Open Questions

Exact remote, hybrid, relocation, and multi-location semantics can be refined later as long as structured vacancy location settings remain explicit and vacancy-linked.

## Last Updated

2026-04-29
