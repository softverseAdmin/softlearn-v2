# Code generation: U5-5-answer-submission

## Implementation plan

No application code for this unit.

This unit defines the answer-submission baseline only. Later backend and frontend units may implement protected exam-attempt submission, response persistence, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U5-5-answer-submission/unit-state.md`
- `aidlc-docs/construction/units/U5-5-answer-submission/functional-design.md`
- `aidlc-docs/construction/units/U5-5-answer-submission/nfr-requirements.md`
- `aidlc-docs/construction/units/U5-5-answer-submission/nfr-design.md`
- `aidlc-docs/construction/units/U5-5-answer-submission/infrastructure-design.md`
- `aidlc-docs/construction/units/U5-5-answer-submission/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, frontend, and exam-domain baselines.
- Confirm the unit defines protected answer submission clearly.
- Confirm the unit remains separate from scoring, pass/fail, history, and retake workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the answer-submission baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected answer-submission flow documented
- Student ownership, validation, and traceability expectations documented
- Relationship to later scoring, pass/fail, history, and retake units documented
- Separation from scoring and result logic preserved
- No application code introduced
