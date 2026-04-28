# Unit: U2-10-student-profile-privacy-settings

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline student privacy-settings flow for authenticated self-service control of company visibility over profile and result data.

## Out of Scope

Concrete frontend/backend implementation code, detailed field-level visibility matrices, override workflows, and framework-specific audit or consent logging implementation.

## Dependencies

Depends on the requirements, security, data-model, RBAC, layout, and earlier student profile baselines.

## Acceptance Criteria

The unit documents student-owned privacy settings, visibility-control domains, consent recording expectations, auditability expectations, and protected-access behavior without producing application code.

## Risks

If privacy settings are modeled inconsistently here, later company visibility, exam-result sharing, audit, and support workflows will drift into conflicting access and consent rules.

## Open Questions

Exact per-field visibility rules, override handling, and retention mechanics can be refined later as long as explicit student control, consent traceability, and auditability stay intact.

## Last Updated

2026-04-29
