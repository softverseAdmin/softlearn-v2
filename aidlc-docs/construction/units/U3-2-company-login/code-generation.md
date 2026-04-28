# Code generation: U3-2-company-login

## Implementation plan

No application code for this unit.

This unit defines the company-login baseline only. Later backend and frontend units may implement login behavior, validation, routing, fallback states, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U3-2-company-login/unit-state.md`
- `aidlc-docs/construction/units/U3-2-company-login/functional-design.md`
- `aidlc-docs/construction/units/U3-2-company-login/nfr-requirements.md`
- `aidlc-docs/construction/units/U3-2-company-login/nfr-design.md`
- `aidlc-docs/construction/units/U3-2-company-login/infrastructure-design.md`
- `aidlc-docs/construction/units/U3-2-company-login/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, auth, API, frontend foundation, routing, state, and layout baselines.
- Confirm the unit defines company-login behavior clearly.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the company-login baseline is rejected or replaced by an approved revision.

## Review checklist

- Company-login flow documented
- Login fields and role boundaries documented
- API, routing, and layout alignment documented
- Scope kept separate from registration and later company-profile units
- No application code introduced
