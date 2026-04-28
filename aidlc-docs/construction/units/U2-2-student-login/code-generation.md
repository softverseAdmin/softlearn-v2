# Code generation: U2-2-student-login

## Implementation plan

No application code for this unit.

This unit defines the student login baseline only. Later backend and frontend units may implement the login form, credential validation, session establishment, redirects, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U2-2-student-login/unit-state.md`
- `aidlc-docs/construction/units/U2-2-student-login/functional-design.md`
- `aidlc-docs/construction/units/U2-2-student-login/nfr-requirements.md`
- `aidlc-docs/construction/units/U2-2-student-login/nfr-design.md`
- `aidlc-docs/construction/units/U2-2-student-login/infrastructure-design.md`
- `aidlc-docs/construction/units/U2-2-student-login/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the auth, API, frontend, routing, state, layout, and registration baselines.
- Confirm the login flow, credential fields, failure outcomes, and post-success session behavior are documented.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the student login baseline is rejected or replaced by an approved revision.

## Review checklist

- Student login flow documented
- Login fields and failure outcomes documented
- Session-auth success behavior documented
- Login kept separate from password reset and later student profile units
- No application code introduced
