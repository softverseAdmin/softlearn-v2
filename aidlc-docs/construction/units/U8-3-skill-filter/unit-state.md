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

Implement structured skill filtering for the student jobs experience using vacancy skill requirements from the shared skill taxonomy.

## Out of Scope

Skill-match scoring, recommendation weighting, and student skill assessment beyond using the shared vacancy taxonomy for filtering.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, frontend initialization, routing, state-management, base-layout, vacancy-skill-tags, job-list-page, and job-search-bar baselines.

## Acceptance Criteria

Students can filter visible jobs by structured vacancy skill tags, and the filter behavior preserves the same visibility posture as the base job list.

## Risks

Skill filtering now shares data with vacancy authoring and later matching units, so taxonomy drift would create inconsistent discovery behavior.

## Open Questions

Later units can add richer multi-skill weighting if they preserve the current structured vacancy-skill filter contract.

## Last Updated

2026-04-30
