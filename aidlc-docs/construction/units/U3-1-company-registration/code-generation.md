# Code generation: U3-1-company-registration

## Implementation plan

No application code for this unit.

This unit defines the company-registration baseline only. Later backend and frontend units may implement registration behavior, validation, routing, fallback states, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U3-1-company-registration/unit-state.md`
- `aidlc-docs/construction/units/U3-1-company-registration/functional-design.md`
- `aidlc-docs/construction/units/U3-1-company-registration/nfr-requirements.md`
- `aidlc-docs/construction/units/U3-1-company-registration/nfr-design.md`
- `aidlc-docs/construction/units/U3-1-company-registration/infrastructure-design.md`
- `aidlc-docs/construction/units/U3-1-company-registration/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, auth, RBAC, API, frontend foundation, routing, state, and layout baselines.
- Confirm the unit defines company-registration behavior clearly.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the company-registration baseline is rejected or replaced by an approved revision.

## Review checklist

- Company-registration flow documented
- Registration data and role boundaries documented
- API, routing, and layout alignment documented
- Scope kept separate from login and later company-profile units
- No application code introduced
