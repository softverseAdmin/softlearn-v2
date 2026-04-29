# Code generation: U6-2-student-exam-results-summary

## Implementation plan

No application code for this unit.

This unit defines the student exam-results-summary baseline only. Later backend and frontend units may implement protected exam-results-summary views, retrieval flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U6-2-student-exam-results-summary/unit-state.md`
- `aidlc-docs/construction/units/U6-2-student-exam-results-summary/functional-design.md`
- `aidlc-docs/construction/units/U6-2-student-exam-results-summary/nfr-requirements.md`
- `aidlc-docs/construction/units/U6-2-student-exam-results-summary/nfr-design.md`
- `aidlc-docs/construction/units/U6-2-student-exam-results-summary/infrastructure-design.md`
- `aidlc-docs/construction/units/U6-2-student-exam-results-summary/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, frontend, and exam-domain baselines.
- Confirm the unit defines protected student exam-results summary clearly.
- Confirm the unit remains separate from company-facing visibility, privacy filtering, and readiness workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the student exam-results-summary baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected student exam-results-summary flow documented
- Student ownership, presentation, and privacy expectations documented
- Relationship to later visibility-sensitive and readiness-sensitive units documented
- Separation from company-facing visibility and readiness logic preserved
- No application code introduced
