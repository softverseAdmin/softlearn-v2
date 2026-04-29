# Unit: U7-4-vacancy-list

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline vacancy-list flow so vacancy records can be surfaced in stable list form for later management and discovery contexts without collapsing detail, search, application, or matching behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, vacancy-detail rendering, student search filters, applications, bookmarks, matching logic, and requirement-tag editing behavior.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, routing, state-management, vacancy-create, vacancy-edit, and vacancy-delete baselines.

## Acceptance Criteria

The unit documents vacancy-list behavior, stable list states, and relationship to later detail and search units without producing application code.

## Risks

If vacancy listing is underspecified here, later company management, student job search, and matching units can drift into conflicting visibility, ordering, and active-vacancy assumptions.

## Open Questions

Exact default ordering, pagination, and management-versus-student list variants can be refined later as long as the baseline vacancy list remains explicit and stable.

## Last Updated

2026-04-29
