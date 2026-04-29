# Unit: U8-5-location-filter

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline location-filter flow so authenticated students can narrow visible jobs using structured vacancy location and work-style settings without collapsing skill, language, salary, bookmarks, or matching into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, skill/language/salary filters, bookmarks, applications, and matching calculation.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, job-list-page, job-search-bar, and vacancy-location-settings baselines.

## Acceptance Criteria

The unit documents location-filter behavior, structured filter boundaries, and relationship to later search and bookmark units without producing application code.

## Risks

If the location filter is underspecified here, later search, bookmark, and matching units can drift into conflicting location-based filtering behavior and alternate vacancy-location interpretations.

## Open Questions

Exact remote/hybrid semantics, multi-location behavior, and empty-filter defaults can be refined later as long as structured location filtering remains explicit and stable.

## Last Updated

2026-04-29
