# Code generation: U3-5-company-hiring-preferences

## Implementation plan

No application code for this unit.

This unit defines the company hiring-preferences baseline only. Later backend and frontend units may implement the preference screen, read/update requests, validation behavior, success handling, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U3-5-company-hiring-preferences/unit-state.md`
- `aidlc-docs/construction/units/U3-5-company-hiring-preferences/functional-design.md`
- `aidlc-docs/construction/units/U3-5-company-hiring-preferences/nfr-requirements.md`
- `aidlc-docs/construction/units/U3-5-company-hiring-preferences/nfr-design.md`
- `aidlc-docs/construction/units/U3-5-company-hiring-preferences/infrastructure-design.md`
- `aidlc-docs/construction/units/U3-5-company-hiring-preferences/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the auth, RBAC, routing, layout, state, and company-profile baselines.
- Confirm the hiring preferences, read/update behavior, and validation outcomes are documented.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the company hiring-preferences baseline is rejected or replaced by an approved revision.

## Review checklist

- Company hiring-preferences flow documented
- Structured preference behavior documented
- Company-boundary ownership and update behavior documented
- Scope kept separate from vacancy-specific and candidate-review logic
- No application code introduced
