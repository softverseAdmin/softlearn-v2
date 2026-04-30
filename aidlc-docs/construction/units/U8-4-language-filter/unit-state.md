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

Implement structured language filtering for the student jobs experience using vacancy language requirements with stable language and minimum-level metadata.

## Out of Scope

Language proficiency scoring, recommendation weighting, and student language assessment beyond using the vacancy language contract for filtering.

## Dependencies

Depends on the requirements, security, data-model, architecture, API, frontend initialization, routing, state-management, base-layout, vacancy-language-requirements, job-list-page, and job-search-bar baselines.

## Acceptance Criteria

Students can filter visible jobs by structured vacancy language requirements, and the filter behavior preserves the same visibility posture as the base job list.

## Risks

Language filtering now shares data with vacancy authoring and later matching units, so contract drift would create inconsistent discovery behavior.

## Open Questions

Later units can refine level semantics if they preserve the current structured vacancy-language filter contract.

## Last Updated

2026-04-30
