# Code generation: U10-1-apply-to-job

## Implementation plan

No application code for this unit.

This unit defines the apply-to-job baseline only. Later frontend and backend units may implement protected submission flows, duplicate-prevention checks, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U10-1-apply-to-job/unit-state.md`
- `aidlc-docs/construction/units/U10-1-apply-to-job/functional-design.md`
- `aidlc-docs/construction/units/U10-1-apply-to-job/nfr-requirements.md`
- `aidlc-docs/construction/units/U10-1-apply-to-job/nfr-design.md`
- `aidlc-docs/construction/units/U10-1-apply-to-job/infrastructure-design.md`
- `aidlc-docs/construction/units/U10-1-apply-to-job/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, vacancy-visibility, and base application API baselines.
- Confirm the unit defines student-owned application creation clearly.
- Confirm the unit remains separate from later status, company review, and interview workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the apply-to-job baseline is rejected or replaced by an approved revision.

## Review checklist

- Student-owned application creation flow documented
- Eligibility, duplicate-prevention, and initial-status expectations documented
- Relationship to later status and company-review units documented
- Separation from downstream workflow actions preserved
- No application code introduced
