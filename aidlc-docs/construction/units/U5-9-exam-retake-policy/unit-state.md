# Unit: U5-9-exam-retake-policy

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Implement explicit exam retake eligibility from shared exam policy, prior attempt count, and pass/fail outcome history.

## Out of Scope

Cooldown windows, admin overrides, and company-facing retake reasoning.

## Dependencies

Depends on shared exam policy fields, scored attempt history, and protected student exam routes.

## Acceptance Criteria

Students are blocked consistently after passing or after reaching the exam’s maximum attempts.

## Risks

If retake eligibility is evaluated differently across summary and exam detail routes, students will get contradictory access outcomes.

## Open Questions

Cooldown or exception handling can be layered later without changing the deterministic attempt-cap baseline.

## Last Updated

2026-05-01
