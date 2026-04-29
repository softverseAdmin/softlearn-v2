# Unit: U18-4-manage-exams

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline manage-exams flow so authorized admins can perform protected exam management with full CRUD-oriented control and auditability.

## Out of Scope

Concrete frontend or backend implementation code, Bulk-import tooling, External exam-platform synchronization, Advanced proctoring workflows, and Heavy analytics.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

The unit documents manage exams behavior, boundaries, and integrations without producing application code.

## Risks

If this unit is underspecified here, later implementation can create authorization gaps, conflicting behavior, or blurred boundaries with adjacent workflows.

## Open Questions

Later implementation can refine detailed field shapes and UX behavior as long as the documented authorization, privacy, and deterministic rules remain intact.

## Last Updated

2026-04-29
