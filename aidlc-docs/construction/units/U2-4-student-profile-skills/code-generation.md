# Code generation: U2-4-student-profile-skills

## Implementation plan

No application code for this unit.

This unit defines the student skill-management baseline only. Later backend and frontend units may implement taxonomy-backed skill read/update behavior, validation, protected routes, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U2-4-student-profile-skills/unit-state.md`
- `aidlc-docs/construction/units/U2-4-student-profile-skills/functional-design.md`
- `aidlc-docs/construction/units/U2-4-student-profile-skills/nfr-requirements.md`
- `aidlc-docs/construction/units/U2-4-student-profile-skills/nfr-design.md`
- `aidlc-docs/construction/units/U2-4-student-profile-skills/infrastructure-design.md`
- `aidlc-docs/construction/units/U2-4-student-profile-skills/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the profile, data-model, security, matching, RBAC, API, frontend foundation, routing, state, and layout baselines.
- Confirm the unit defines structured student skill management and shared taxonomy expectations clearly.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the student skill-management baseline is rejected or replaced by an approved revision.

## Review checklist

- Student skill-management flow documented
- Shared skill taxonomy direction documented
- Self-service ownership and validation behavior documented
- Scope kept separate from education, experience, resume, privacy, and vacancy-side skill units
- No application code introduced
