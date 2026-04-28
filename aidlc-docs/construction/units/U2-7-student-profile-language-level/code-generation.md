# Code generation: U2-7-student-profile-language-level

## Implementation plan

No application code for this unit.

This unit defines the student language-level management baseline only. Later backend and frontend units may implement taxonomy-backed language read/update behavior, validation, protected routes, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U2-7-student-profile-language-level/unit-state.md`
- `aidlc-docs/construction/units/U2-7-student-profile-language-level/functional-design.md`
- `aidlc-docs/construction/units/U2-7-student-profile-language-level/nfr-requirements.md`
- `aidlc-docs/construction/units/U2-7-student-profile-language-level/nfr-design.md`
- `aidlc-docs/construction/units/U2-7-student-profile-language-level/infrastructure-design.md`
- `aidlc-docs/construction/units/U2-7-student-profile-language-level/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the profile, data-model, security, matching, RBAC, frontend foundation, routing, state, and layout baselines.
- Confirm the unit defines structured student language-level management and summary-alignment expectations clearly.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the student language-level management baseline is rejected or replaced by an approved revision.

## Review checklist

- Student language-level management flow documented
- Shared language taxonomy direction documented
- Detailed-record and basic-summary alignment documented
- Self-service ownership and validation behavior documented
- No application code introduced
