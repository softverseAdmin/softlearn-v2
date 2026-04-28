# Code generation: U3-4-company-profile-description

## Implementation plan

No application code for this unit.

This unit defines the company profile-description baseline only. Later backend and frontend units may implement the description screen, read/update requests, validation behavior, success handling, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U3-4-company-profile-description/unit-state.md`
- `aidlc-docs/construction/units/U3-4-company-profile-description/functional-design.md`
- `aidlc-docs/construction/units/U3-4-company-profile-description/nfr-requirements.md`
- `aidlc-docs/construction/units/U3-4-company-profile-description/nfr-design.md`
- `aidlc-docs/construction/units/U3-4-company-profile-description/infrastructure-design.md`
- `aidlc-docs/construction/units/U3-4-company-profile-description/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the API, auth, RBAC, frontend foundation, routing, state, and layout baselines.
- Confirm the company description, read/update behavior, and validation outcomes are documented.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the company profile-description baseline is rejected or replaced by an approved revision.

## Review checklist

- Company profile-description flow documented
- Narrative description behavior documented
- Company-boundary ownership and update behavior documented
- Scope kept separate from identity, hiring preferences, and vacancy-detail units
- No application code introduced
