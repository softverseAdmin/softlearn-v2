# Unit: U16-1-role-permissions

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline operational role-permissions model so student, company, and admin workflows use one consistent permission vocabulary across the later product surface.

## Out of Scope

Concrete frontend or backend implementation code, Company-specific relationship rules, Full policy engine implementation, External identity integration, and Attribute-based access expansion.

## Dependencies

Depends on the requirements, security, data-model, architecture, shared authorization/API baselines, and adjacent domain units listed in the functional design.

## Acceptance Criteria

The unit documents role permissions behavior, boundaries, and integrations without producing application code.

## Risks

If this unit is underspecified here, later implementation can create authorization gaps, conflicting behavior, or blurred boundaries with adjacent workflows.

## Open Questions

Later implementation can refine detailed field shapes and UX behavior as long as the documented authorization, privacy, and deterministic rules remain intact.

## Last Updated

2026-04-29
