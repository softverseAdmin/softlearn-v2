# Unit: U8-6-salary-filter

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline salary-filter flow so authenticated students can narrow visible jobs using approved salary-ready vacancy data without collapsing other filters, bookmarks, or matching into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, skill/language/location filters, bookmarks, applications, and matching calculation.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, job-list-page, and job-search-bar baselines plus the vacancy domain's salary-ready metadata direction.

## Acceptance Criteria

The unit documents salary-filter behavior, salary-range boundaries, and relationship to later search and bookmark units without producing application code.

## Risks

If the salary filter is underspecified here, later search, bookmark, and matching units can drift into conflicting compensation-based filtering behavior and alternate vacancy salary interpretations.

## Open Questions

Exact salary-range normalization, currency handling, and missing-salary behavior can be refined later as long as salary filtering remains explicit and stable.

## Last Updated

2026-04-29
