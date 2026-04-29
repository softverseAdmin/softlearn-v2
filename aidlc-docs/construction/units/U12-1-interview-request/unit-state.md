# Unit: U12-1-interview-request

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline interview-request flow so an authorized company user can request an interview from an approved candidate context and create the initial interview lifecycle record.

## Out of Scope

Concrete frontend or backend implementation code, Availability collection, Meeting-link handling, Schedule confirmation, and Notification delivery.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

The unit documents interview request behavior, boundaries, and integrations without producing application code.

## Risks

If this unit is underspecified here, later implementation can create authorization gaps, conflicting behavior, or blurred boundaries with adjacent workflows.

## Open Questions

Later implementation can refine detailed field shapes and UX behavior as long as the documented authorization, privacy, and deterministic rules remain intact.

## Last Updated

2026-04-29
