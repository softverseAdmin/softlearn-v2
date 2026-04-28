# Unit: U4-8-course-completion-tracking

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline course-completion flow so a student’s finished-course outcome can be tracked as protected, enrollment-linked learning evidence derived from lesson progress.

## Out of Scope

Concrete frontend/backend implementation code, lesson authoring, enrollment creation, lesson-progress implementation detail, certification issuance, and readiness-score calculation.

## Dependencies

Depends on the requirements, security, data-model, privacy, lesson progress, and learning-route baselines.

## Acceptance Criteria

The unit documents course-completion behavior, derivation expectations, and protected learning-evidence boundaries without producing application code.

## Risks

If course completion is vague here, later readiness, matching, privacy, and company-visibility units can drift into conflicting completion or learning-evidence rules.

## Open Questions

Exact completion thresholds, certificate UX, and manual override policy can be refined later as long as completion remains derived from protected enrollment-linked learning state.

## Last Updated

2026-04-29
