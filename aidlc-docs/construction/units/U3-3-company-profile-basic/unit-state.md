# Unit: U3-3-company-profile-basic

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline company basic-profile flow for authenticated self-service viewing and updating of core organization identity fields.

## Out of Scope

Concrete frontend/backend implementation code, rich company description, hiring preferences, vacancy setup, candidate workflows, and company membership behavior.

## Dependencies

Depends on the requirements, security, data-model, auth, RBAC, API, frontend foundation, routing, layout, state-management, and company auth baselines.

## Acceptance Criteria

The unit documents company basic-profile read/update behavior, company-boundary ownership rules, and protected-access behavior without producing application code.

## Risks

If the company basic profile is modeled inconsistently here, later company description, hiring preferences, vacancies, and company-user management units will drift into conflicting identity and ownership behavior.

## Open Questions

Exact field set beyond the basic identity baseline can be refined later as long as company-boundary ownership and API alignment stay intact.

## Last Updated

2026-04-29
