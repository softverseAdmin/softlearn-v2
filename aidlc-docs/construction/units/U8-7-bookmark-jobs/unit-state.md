# Unit: U8-7-bookmark-jobs

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline bookmark-jobs flow so authenticated students can save visible jobs for later review without collapsing applications, search filters, or matching behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, applications, matching logic, recommendation behavior, and company-side bookmark visibility.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, frontend initialization, routing, state-management, base-layout, job-list-page, job-search-bar, and vacancy-detail baselines.

## Acceptance Criteria

The unit documents student job-bookmark behavior, ownership boundaries, and relationship to later application and matching units without producing application code.

## Risks

If bookmarking is underspecified here, later saved-job, application, and matching units can drift into conflicting bookmark ownership, visible-job eligibility, and later-review expectations.

## Open Questions

Exact saved-jobs page behavior, bookmark ordering, and reminder or notification features can be refined later as long as student-owned job bookmarking remains explicit and traceable.

## Last Updated

2026-04-29
