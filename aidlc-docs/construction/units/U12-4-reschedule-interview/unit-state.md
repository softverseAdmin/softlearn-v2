# Unit: U12-4-reschedule-interview

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline reschedule-interview flow so an existing interview can move through an explicit rescheduling path without losing the prior schedule, history, or authorization posture.

## Out of Scope

Concrete frontend or backend implementation code, Meeting-link provider updates, Calendar synchronization, Cancellation logic, and Interview completion handling.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

The unit documents reschedule interview behavior, boundaries, and integrations without producing application code.

## Risks

If this unit is underspecified here, later implementation can create authorization gaps, conflicting behavior, or blurred boundaries with adjacent workflows.

## Open Questions

Later implementation can refine detailed field shapes and UX behavior as long as the documented authorization, privacy, and deterministic rules remain intact.

## Last Updated

2026-04-29
