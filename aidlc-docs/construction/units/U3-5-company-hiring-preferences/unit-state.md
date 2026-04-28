# Unit: U3-5-company-hiring-preferences

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline company hiring-preferences flow for authenticated self-service management of structured organization-level hiring defaults.

## Out of Scope

Concrete frontend/backend implementation code, vacancy-specific requirements, candidate-review logic, and company membership behavior.

## Dependencies

Depends on the requirements, security, data-model, auth, RBAC, frontend foundation, routing, layout, state-management, and company-profile baselines.

## Acceptance Criteria

The unit documents company hiring-preferences behavior, company-boundary ownership rules, and protected-access behavior without producing application code.

## Risks

If company hiring preferences are modeled inconsistently here, later vacancy, matching, and candidate-review units will drift into conflicting default settings and ownership behavior.

## Open Questions

Exact preference taxonomy and later linkage to vacancy templates can be refined later as long as company-boundary ownership and structured preference behavior stay intact.

## Last Updated

2026-04-29
