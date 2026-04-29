# Unit: U18-5-manage-vacancies

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline manage-vacancies flow so authorized admins can perform protected vacancy management with full CRUD-oriented control and auditability.

## Out of Scope

Concrete frontend or backend implementation code, Bulk-import tooling, External ATS synchronization, Company self-service vacancy workflows, and Heavy analytics.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

The unit documents manage vacancies behavior, boundaries, and integrations without producing application code.

## Risks

If this unit is underspecified here, later implementation can create authorization gaps, conflicting behavior, or blurred boundaries with adjacent workflows.

## Open Questions

Later implementation can refine detailed field shapes and UX behavior as long as the documented authorization, privacy, and deterministic rules remain intact.

## Last Updated

2026-04-29
