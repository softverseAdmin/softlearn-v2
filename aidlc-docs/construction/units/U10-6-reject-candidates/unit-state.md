# Unit: U10-6-reject-candidates

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline reject-candidates flow so authorized company users can mark an application as rejected using deterministic authorization, terminal-state, and audit rules without collapsing notification or interview behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, application creation, passive company review, shortlist actions, notification delivery, and interview scheduling.

## Dependencies

Depends on the requirements, security, data-model, architecture, company authorization baselines, company application review baseline, and application-status-tracking baseline.

## Acceptance Criteria

The unit documents deterministic company-side rejection behavior, terminal-state expectations, and relationship to shared application status without producing application code.

## Risks

If rejection behavior is underspecified here, later implementation can create unauthorized adverse decisions, conflicting terminal states, or missing audit evidence for candidate outcomes.

## Open Questions

Exact future handling of structured rejection reasons and student-facing communication timing can be refined later as long as rejection remains authorized, explicit, and auditable.

## Last Updated

2026-04-29
