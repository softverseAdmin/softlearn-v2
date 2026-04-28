# Unit: U1-2-authentication-core

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the shared browser authentication foundation for students, company users, and admins using Django-native session-based auth.

## Out of Scope

Detailed RBAC policy, domain authorization rules, SSO, social login, mobile token auth, and framework implementation code.

## Dependencies

Depends on ADR-001, the recommended architecture, the security baseline, and alignment with the base API contract.

## Acceptance Criteria

- Session-based auth is defined as the default browser auth model.
- Signup, login, logout, session restore, password change, and password reset are covered.
- Auth is clearly separated from RBAC and privacy authorization.
- No application code is produced.

## Risks

If the auth baseline is inconsistent, later protected flows will drift across frontend, backend, privacy, and admin features.

## Open Questions

Exact password reset delivery mechanics, account lockout thresholds, and remember-me policy can be refined during implementation.

## Last Updated

2026-04-28
