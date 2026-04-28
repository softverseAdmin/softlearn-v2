# Code generation: U2-3-student-profile-basic

## Implementation plan

No application code for this unit.

This unit defines the student basic profile baseline only. Later backend and frontend units may implement the profile screen, read/update requests, validation behavior, success handling, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U2-3-student-profile-basic/unit-state.md`
- `aidlc-docs/construction/units/U2-3-student-profile-basic/functional-design.md`
- `aidlc-docs/construction/units/U2-3-student-profile-basic/nfr-requirements.md`
- `aidlc-docs/construction/units/U2-3-student-profile-basic/nfr-design.md`
- `aidlc-docs/construction/units/U2-3-student-profile-basic/infrastructure-design.md`
- `aidlc-docs/construction/units/U2-3-student-profile-basic/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the API, auth, RBAC, frontend foundation, routing, state, and layout baselines.
- Confirm the basic profile fields, read/update behavior, and validation outcomes are documented.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the student basic profile baseline is rejected or replaced by an approved revision.

## Review checklist

- Student basic profile flow documented
- Basic profile fields documented
- Self-service ownership and update behavior documented
- Basic profile scope kept separate from later student-detail units
- No application code introduced
