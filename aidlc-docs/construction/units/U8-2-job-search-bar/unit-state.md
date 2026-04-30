# Unit: U8-2-job-search-bar

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement the student job search bar so authenticated students can refine visible jobs through a general query without collapsing structured filters, bookmarks, applications, or matching into the same unit.

## Out of Scope

Search ranking optimization, recommendation behavior, and salary filtering beyond the visible discovery query shipped in this unit.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, frontend initialization, routing, state-management, base-layout, and job-list-page baseline.

## Acceptance Criteria

Students can search visible jobs through a stable query flow, and search results preserve the same active and authorized vacancy boundaries as the base job list.

## Risks

Search now drives student discovery, so any visibility drift would expose unauthorized jobs or create inconsistent filter state.

## Open Questions

Later units can refine ranking or debounce behavior if they preserve the current visible-vacancy search contract.

## Last Updated

2026-04-30
