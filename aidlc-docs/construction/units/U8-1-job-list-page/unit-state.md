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

Implement the protected student job-list-page flow so authenticated students can browse visible active vacancies in list form without collapsing search-bar behavior, structured filters, bookmarks, applications, or matching into the same unit.

## Out of Scope

Search-bar behavior, skill/language/location/salary filters, bookmarks, applications, and matching logic.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, frontend initialization, routing, state-management, base-layout, vacancy-list, and vacancy-detail baselines.

## Acceptance Criteria

Students can open a protected jobs page and browse only the visible active vacancy subset with stable loading, empty, and populated list states.

## Risks

If vacancy visibility rules drift here, later search, bookmark, application, and matching units can build on an inconsistent browseable vacancy set.

## Open Questions

Later units can refine ordering density, pagination, and transition into job-detail flows as long as the visible active vacancy baseline remains intact.

## Last Updated

2026-04-30
