# Code generation: U1-3-role-based-access-control

## Implementation plan

No application code for this unit.

This unit defines the authorization baseline only. Later backend units may implement role checks, company-boundary checks, admin scope controls, permission helpers, audit hooks, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U1-3-role-based-access-control/unit-state.md`
- `aidlc-docs/construction/units/U1-3-role-based-access-control/functional-design.md`
- `aidlc-docs/construction/units/U1-3-role-based-access-control/nfr-requirements.md`
- `aidlc-docs/construction/units/U1-3-role-based-access-control/nfr-design.md`
- `aidlc-docs/construction/units/U1-3-role-based-access-control/infrastructure-design.md`
- `aidlc-docs/construction/units/U1-3-role-based-access-control/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the authentication, architecture, security, and requirements baselines.
- Confirm role categories, ownership rules, company boundary rules, and policy-gated access are covered.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the RBAC baseline is rejected or replaced by an approved revision.

## Review checklist

- Student/company/admin role model documented
- Deny-by-default authorization documented
- Ownership and company-boundary rules documented
- Privacy/consent still required beyond role checks
- No application code introduced
