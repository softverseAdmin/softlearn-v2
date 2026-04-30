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

Implement structured location and work-style filtering for the student jobs experience using vacancy location metadata, work style, and relocation-support posture.

## Out of Scope

Location-match scoring, map integrations, and advanced multi-region recommendation behavior beyond the structured vacancy location contract used for filtering.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, frontend initialization, routing, state-management, base-layout, vacancy-location-settings, job-list-page, and job-search-bar baselines.

## Acceptance Criteria

Students can filter visible jobs by location and work style, and the filter behavior preserves the same visibility posture as the base job list.

## Risks

Location filtering now shares data with vacancy authoring and later matching units, so inconsistent work-style or location handling would create confusing discovery behavior.

## Open Questions

Later units can refine remote and region semantics if they preserve the current structured location/work-style filter contract.

## Last Updated

2026-04-30
