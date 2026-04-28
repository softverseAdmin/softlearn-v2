# Code generation: U3-6-company-user-management

## Implementation plan

No application code for this unit.

This unit defines the company user-management baseline only. Later backend and frontend units may implement the member-management screen, list/update requests, validation behavior, success handling, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U3-6-company-user-management/unit-state.md`
- `aidlc-docs/construction/units/U3-6-company-user-management/functional-design.md`
- `aidlc-docs/construction/units/U3-6-company-user-management/nfr-requirements.md`
- `aidlc-docs/construction/units/U3-6-company-user-management/nfr-design.md`
- `aidlc-docs/construction/units/U3-6-company-user-management/infrastructure-design.md`
- `aidlc-docs/construction/units/U3-6-company-user-management/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the auth, RBAC, routing, layout, state, and company-profile baselines.
- Confirm the company user-management behavior, membership model, and role-scope expectations are documented.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the company user-management baseline is rejected or replaced by an approved revision.

## Review checklist

- Company user-management flow documented
- Company-membership and role-scope behavior documented
- Company-boundary ownership and update behavior documented
- Scope kept separate from public registration, admin override, and enterprise-IAM concerns
- No application code introduced
