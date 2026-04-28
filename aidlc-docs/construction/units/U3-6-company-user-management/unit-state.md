# Unit: U3-6-company-user-management

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline company user-management flow for authenticated management of company-member accounts within a single company context.

## Out of Scope

Concrete frontend/backend implementation code, admin override behavior, enterprise IAM, external directory integration, and vacancy assignment details.

## Dependencies

Depends on the requirements, security, data-model, auth, RBAC, frontend foundation, routing, layout, state-management, and earlier company-profile baselines.

## Acceptance Criteria

The unit documents company user-management behavior, company-membership model, company-boundary ownership rules, and protected-access behavior without producing application code.

## Risks

If company user management is modeled inconsistently here, later company workflow ownership, audit, and company-boundary access rules will drift into conflicting membership behavior.

## Open Questions

Exact membership role taxonomy, invite/provisioning posture, and later workflow assignment detail can be refined later as long as company-boundary ownership and role-scope behavior stay intact.

## Last Updated

2026-04-29
