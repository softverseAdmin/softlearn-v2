# Unit: U3-2-company-login

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline company-login flow for authenticated entry of an existing company-side account under the shared session-auth model.

## Out of Scope

Concrete frontend/backend implementation code, password reset detail, company profile setup, and advanced company-auth extensions.

## Dependencies

Depends on the requirements, security, auth, API, frontend foundation, routing, layout, state-management, and company-registration baselines.

## Acceptance Criteria

The unit documents company-login behavior, role boundaries, session-auth alignment, and protected access behavior without producing application code.

## Risks

If company login is modeled inconsistently here, later company profile, hiring preferences, company-user management, and candidate-review units will drift into conflicting role and session behavior.

## Open Questions

Exact account-lockout posture, password reset handoff, and any future enterprise-login extensions can be refined later as long as shared auth alignment and role boundaries stay intact.

## Last Updated

2026-04-29
