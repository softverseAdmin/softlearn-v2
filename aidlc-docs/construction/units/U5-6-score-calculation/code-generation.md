# Code generation: U5-6-score-calculation

## Implementation plan

No application code for this unit.

This unit defines the score-calculation baseline only. Later backend units may implement deterministic scoring, evaluation workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U5-6-score-calculation/unit-state.md`
- `aidlc-docs/construction/units/U5-6-score-calculation/functional-design.md`
- `aidlc-docs/construction/units/U5-6-score-calculation/nfr-requirements.md`
- `aidlc-docs/construction/units/U5-6-score-calculation/nfr-design.md`
- `aidlc-docs/construction/units/U5-6-score-calculation/infrastructure-design.md`
- `aidlc-docs/construction/units/U5-6-score-calculation/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and exam-domain baselines.
- Confirm the unit defines deterministic score calculation clearly.
- Confirm the unit remains separate from pass/fail, history, retake, and visibility workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the score-calculation baseline is rejected or replaced by an approved revision.

## Review checklist

- Deterministic score-calculation flow documented
- Evaluation, validation, and traceability expectations documented
- Relationship to later pass/fail, history, retake, and readiness-sensitive units documented
- Separation from policy and visibility logic preserved
- No application code introduced
