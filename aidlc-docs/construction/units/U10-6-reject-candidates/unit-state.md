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

Implement the protected reject-candidates flow so authorized company users can mark an application as rejected using deterministic authorization, terminal-state, and audit rules.

## Out of Scope

Notification delivery and interview scheduling beyond the implemented rejection transition and company application review behavior.

## Dependencies

Depends on the requirements, security, data-model, architecture, company authorization baselines, company application review baseline, and application-status-tracking baseline.

## Acceptance Criteria

Authorized company users can reject eligible applications, and the rejected terminal state plus history are persisted and exposed through company application review.

## Risks

If rejection behavior is underspecified here, later implementation can create unauthorized adverse decisions, conflicting terminal states, or missing audit evidence for candidate outcomes.

## Open Questions

Exact future handling of structured rejection reasons and student-facing communication timing can be refined later as long as rejection remains authorized, explicit, and auditable.

## Last Updated

2026-04-30
