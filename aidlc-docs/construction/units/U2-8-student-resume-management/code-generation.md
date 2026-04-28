# Code generation: U2-8-student-resume-management

## Implementation plan

No application code for this unit.

This unit defines the student resume-management baseline only. Later backend and frontend units may implement resume metadata handling, optional protected file upload behavior, validation, protected routes, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U2-8-student-resume-management/unit-state.md`
- `aidlc-docs/construction/units/U2-8-student-resume-management/functional-design.md`
- `aidlc-docs/construction/units/U2-8-student-resume-management/nfr-requirements.md`
- `aidlc-docs/construction/units/U2-8-student-resume-management/nfr-design.md`
- `aidlc-docs/construction/units/U2-8-student-resume-management/infrastructure-design.md`
- `aidlc-docs/construction/units/U2-8-student-resume-management/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the data-model, security, matching, architecture, RBAC, frontend foundation, routing, state, and layout baselines.
- Confirm the unit defines structured resume management and optional upload-safety expectations clearly.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the student resume-management baseline is rejected or replaced by an approved revision.

## Review checklist

- Student resume-management flow documented
- Resume metadata and optional file-safety direction documented
- Self-service ownership and validation behavior documented
- Scope kept separate from privacy-policy and company-review units
- No application code introduced
