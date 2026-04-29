# Code generation: U6-1-student-learning-summary

## Implementation plan

No application code for this unit.

This unit defines the student learning-summary baseline only. Later backend and frontend units may implement protected learning-summary views, retrieval flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U6-1-student-learning-summary/unit-state.md`
- `aidlc-docs/construction/units/U6-1-student-learning-summary/functional-design.md`
- `aidlc-docs/construction/units/U6-1-student-learning-summary/nfr-requirements.md`
- `aidlc-docs/construction/units/U6-1-student-learning-summary/nfr-design.md`
- `aidlc-docs/construction/units/U6-1-student-learning-summary/infrastructure-design.md`
- `aidlc-docs/construction/units/U6-1-student-learning-summary/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, frontend, and learning-domain baselines.
- Confirm the unit defines protected student learning summary clearly.
- Confirm the unit remains separate from exam-result summaries, company-facing visibility, and readiness workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the student learning-summary baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected student learning-summary flow documented
- Student ownership, presentation, and privacy expectations documented
- Relationship to later visibility-sensitive and readiness-sensitive units documented
- Separation from exam-result and company-facing visibility logic preserved
- No application code introduced
