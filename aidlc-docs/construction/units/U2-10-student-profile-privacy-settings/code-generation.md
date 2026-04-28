# Code generation: U2-10-student-profile-privacy-settings

## Implementation plan

No application code for this unit.

This unit defines the student privacy-settings baseline only. Later backend and frontend units may implement privacy-setting read/update behavior, consent recording, audit hooks, protected routes, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U2-10-student-profile-privacy-settings/unit-state.md`
- `aidlc-docs/construction/units/U2-10-student-profile-privacy-settings/functional-design.md`
- `aidlc-docs/construction/units/U2-10-student-profile-privacy-settings/nfr-requirements.md`
- `aidlc-docs/construction/units/U2-10-student-profile-privacy-settings/nfr-design.md`
- `aidlc-docs/construction/units/U2-10-student-profile-privacy-settings/infrastructure-design.md`
- `aidlc-docs/construction/units/U2-10-student-profile-privacy-settings/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, RBAC, and student-profile baselines.
- Confirm the unit defines student privacy settings, consent recording expectations, and auditability expectations clearly.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the student privacy-settings baseline is rejected or replaced by an approved revision.

## Review checklist

- Student privacy-settings flow documented
- Profile and exam-result visibility direction documented
- Consent and auditability expectations documented
- Self-service ownership and company-visibility boundaries documented
- No application code introduced
