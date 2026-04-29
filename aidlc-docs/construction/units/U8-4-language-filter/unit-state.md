# Unit: U8-4-language-filter

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline language-filter flow so authenticated students can narrow visible jobs using structured vacancy language requirements without collapsing skill, location, salary, bookmarks, or matching into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, skill/location/salary filters, bookmarks, applications, and matching calculation.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, job-list-page, job-search-bar, and vacancy-language-requirements baselines.

## Acceptance Criteria

The unit documents language-filter behavior, structured filter boundaries, and relationship to later search and bookmark units without producing application code.

## Risks

If the language filter is underspecified here, later search, bookmark, and matching units can drift into conflicting language-based filtering behavior and alternate vacancy-language interpretations.

## Open Questions

Exact multi-select behavior, minimum-level semantics, and empty-filter defaults can be refined later as long as structured language filtering remains explicit and stable.

## Last Updated

2026-04-29
