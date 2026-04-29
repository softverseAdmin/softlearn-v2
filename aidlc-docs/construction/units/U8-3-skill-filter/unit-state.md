# Unit: U8-3-skill-filter

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline skill-filter flow so authenticated students can narrow visible jobs using structured vacancy skill requirements without collapsing language, location, salary, bookmarks, or matching into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, language/location/salary filters, bookmarks, applications, and matching calculation.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, job-list-page, job-search-bar, and vacancy-skill-tags baselines.

## Acceptance Criteria

The unit documents skill-filter behavior, structured filter boundaries, and relationship to later search and bookmark units without producing application code.

## Risks

If the skill filter is underspecified here, later search, bookmark, and matching units can drift into conflicting skill-based filtering behavior and alternate vacancy-skill interpretations.

## Open Questions

Exact multi-select behavior, required-versus-preferred skill filtering semantics, and empty-filter defaults can be refined later as long as structured skill filtering remains explicit and stable.

## Last Updated

2026-04-29
