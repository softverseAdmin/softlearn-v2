# Unit: U20-2-auth-redesign

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Redesign the public login and signup experience into a professional SaaS auth flow with responsive layout, role-first signup, and stronger product framing.

## Out of Scope

Password-reset backend implementation, social auth, premium purchase flow, and protected dashboard redesign outside the auth pages.

## Dependencies

Depends on CHG-002, the accepted auth/session baseline, routing/layout foundations, and the existing public auth pages.

## Acceptance Criteria

The auth pages are documented and implemented as a minimal, role-aware, mobile-friendly SaaS entry flow aligned with the existing backend auth APIs.

## Risks

Because the backend does not yet provide password-reset support, the forgot-password interaction must remain honest and non-destructive.

## Open Questions

Later units can add full password reset, social login, or premium upsell behavior without replacing this auth-page structure.

## Last Updated

2026-04-29
