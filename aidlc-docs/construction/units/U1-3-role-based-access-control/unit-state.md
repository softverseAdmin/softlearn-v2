# Unit: U1-3-role-based-access-control

Status: completed

Baseline inception version: v1

## Stages

- [x] Functional Design
- [x] NFR Requirements
- [x] NFR Design
- [x] Infrastructure Design
- [x] Code Generation

## Scope

Define the baseline role-based access control model for students, company users, and admins across protected platform workflows.

## Out of Scope

Detailed per-field privacy matrices, framework-specific permission code, enterprise IAM, and application implementation code.

## Dependencies

Depends on U1-2 authentication core plus the architecture, security, and requirements baselines.

## Acceptance Criteria

- Student, company user, and admin roles are defined clearly.
- Ownership, organization-boundary, and admin-scope rules are documented.
- Authorization is separated from authentication and from privacy-policy evaluation.
- No application code is produced.

## Risks

If the RBAC baseline is weak or inconsistent, later profile, exam, hiring, and admin units will drift into unsafe authorization behavior.

## Open Questions

Fine-grained field-level visibility and delegated company permissions can be refined in later privacy, consent, and admin units.

## Last Updated

2026-04-28
