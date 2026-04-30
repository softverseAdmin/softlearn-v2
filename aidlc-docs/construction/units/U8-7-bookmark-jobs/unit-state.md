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

Implement protected student job bookmarks so authenticated students can save and unsave visible jobs from the discovery experience without collapsing applications or matching behavior into the same unit.

## Out of Scope

Saved-jobs reminder workflows, recommendation signals, and company-side bookmark visibility beyond the protected student-owned bookmark behavior shipped in this unit.

## Dependencies

Depends on the requirements, security, data-model, architecture, authentication, RBAC, API, frontend initialization, routing, state-management, base-layout, job-list-page, job-search-bar, skill-filter, language-filter, and location-filter baselines.

## Acceptance Criteria

Students can save and remove visible-job bookmarks through protected flows, and bookmark state is surfaced consistently in the student jobs experience.

## Risks

Bookmarking now sits in the main discovery flow, so visibility or ownership drift would leak student-specific state or expose unauthorized vacancies.

## Open Questions

Later units can add saved-job pages or reminder behavior if they preserve the current student-owned bookmark model.

## Last Updated

2026-04-30
