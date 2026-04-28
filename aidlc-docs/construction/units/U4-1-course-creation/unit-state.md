# Unit: U4-1-course-creation

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline protected course-creation flow so authorized platform operators can create structured course records without collapsing listing, detail, lesson, or enrollment behavior into the same unit.

## Out of Scope

Concrete frontend/backend implementation code, course editing, course deletion, lesson authoring, enrollment behavior, student progress, and broad admin course-management workflows.

## Dependencies

Depends on the requirements, security, data-model, authentication, RBAC, API, routing, state-management, and base-layout baselines.

## Acceptance Criteria

The unit documents protected course creation, validation outcomes, authoring boundaries, and relationship to later learning units without producing application code.

## Risks

If course creation is left ambiguous here, later listing, detail, lesson, and admin-management units can drift into conflicting authoring, visibility, and publication behavior.

## Open Questions

Exact draft-versus-published lifecycle rules, authoring roles beyond baseline admin access, and richer course metadata can be refined later as long as protected course creation remains explicit.

## Last Updated

2026-04-29
