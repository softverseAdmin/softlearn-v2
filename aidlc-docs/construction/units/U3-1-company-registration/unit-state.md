# Unit: U3-1-company-registration

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline company-registration flow for authenticated creation of an initial company-side account under the shared session-auth model.

## Out of Scope

Concrete frontend/backend implementation code, richer company onboarding details, company login specialization, and multi-user company invitation workflows.

## Dependencies

Depends on the requirements, security, auth, RBAC, API, frontend foundation, routing, layout, and state-management baselines.

## Acceptance Criteria

The unit documents minimum company account creation, role boundaries, session-auth alignment, and protected registration behavior without producing application code.

## Risks

If company registration is modeled inconsistently here, later company login, company profile, hiring preferences, and company-user management units will drift into conflicting role and onboarding behavior.

## Open Questions

Exact field set, approval posture, and email verification behavior can be refined later as long as shared auth alignment and role boundaries stay intact.

## Last Updated

2026-04-29
