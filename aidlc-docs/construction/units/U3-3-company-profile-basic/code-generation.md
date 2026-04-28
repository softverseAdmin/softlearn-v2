# Code generation: U3-3-company-profile-basic

## Implementation plan

No application code for this unit.

This unit defines the company basic-profile baseline only. Later backend and frontend units may implement the profile screen, read/update requests, validation behavior, success handling, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U3-3-company-profile-basic/unit-state.md`
- `aidlc-docs/construction/units/U3-3-company-profile-basic/functional-design.md`
- `aidlc-docs/construction/units/U3-3-company-profile-basic/nfr-requirements.md`
- `aidlc-docs/construction/units/U3-3-company-profile-basic/nfr-design.md`
- `aidlc-docs/construction/units/U3-3-company-profile-basic/infrastructure-design.md`
- `aidlc-docs/construction/units/U3-3-company-profile-basic/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the API, auth, RBAC, frontend foundation, routing, state, and layout baselines.
- Confirm the basic company profile fields, read/update behavior, and validation outcomes are documented.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the company basic-profile baseline is rejected or replaced by an approved revision.

## Review checklist

- Company basic-profile flow documented
- Core basic-profile fields documented
- Company-boundary ownership and update behavior documented
- Scope kept separate from description, hiring preferences, and company-user management units
- No application code introduced
