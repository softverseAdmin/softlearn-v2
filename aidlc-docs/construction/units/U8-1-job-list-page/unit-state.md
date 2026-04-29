# Unit: U8-1-job-list-page

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline student job-list-page flow so authenticated students can browse visible active vacancies in list form without collapsing search-bar behavior, structured filters, bookmarks, applications, or matching into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, search-bar behavior, skill/language/location/salary filters, bookmarks, applications, and matching logic.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, frontend initialization, routing, state-management, base-layout, vacancy-list, and vacancy-detail baselines.

## Acceptance Criteria

The unit documents student job-list-page behavior, visible-vacancy boundaries, and relationship to later search and bookmark units without producing application code.

## Risks

If the job list page is underspecified here, later search, bookmark, application, and matching units can drift into conflicting assumptions about which vacancies students may browse and how list states behave.

## Open Questions

Exact default ordering, pagination, and empty-state messaging can be refined later as long as the visible job-list page remains explicit and aligned with the vacancy visibility baseline.

## Last Updated

2026-04-29
