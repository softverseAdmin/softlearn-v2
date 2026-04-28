# Unit: U2-3-student-profile-basic

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline student basic profile flow for authenticated self-service viewing and updating of core student profile information.

## Out of Scope

Concrete frontend/backend implementation code, company/admin views of student data, and later student-detail units such as skills, education, experience, resume, availability, and privacy settings.

## Dependencies

Depends on the auth, RBAC, API, frontend foundation, routing, state, layout, registration, and login baselines.

## Acceptance Criteria

- Student basic profile read and update behavior is documented clearly.
- Basic profile fields and validation outcomes are defined.
- Ownership and protected-route behavior are aligned with session auth and RBAC.
- No application code is produced.

## Risks

If basic profile behavior is inconsistent, later student-detail units will drift into conflicting field ownership, validation, and protected-route patterns.

## Open Questions

Exact profile completion scoring, inline save behavior, and richer onboarding sequencing can be refined in later units.

## Last Updated

2026-04-29
