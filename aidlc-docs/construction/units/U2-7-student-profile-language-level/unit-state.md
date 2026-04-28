# Unit: U2-7-student-profile-language-level

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline student language-level management flow for authenticated self-service maintenance of structured language records aligned with the shared taxonomy.

## Out of Scope

Concrete frontend/backend implementation code, certification verification workflows, and separate resume, availability, privacy, vacancy-language, and matching-calculation units.

## Dependencies

Depends on the requirements, data-model, security, matching, RBAC, frontend foundation, routing, state, layout, and basic student profile baselines.

## Acceptance Criteria

The unit documents structured student language-level management, detailed-record and summary alignment, self-service ownership boundaries, and protected-access behavior without producing application code.

## Risks

If language levels are modeled inconsistently here, later vacancy matching, filtering, and profile-summary behavior will drift into incompatible taxonomy identifiers and access rules.

## Open Questions

Exact field set, supported languages beyond the baseline, and any future certification-proof attachments can be refined later as long as shared taxonomy alignment stays intact.

## Last Updated

2026-04-29
