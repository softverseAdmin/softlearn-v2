# Code generation: U5-9-exam-retake-policy

## Implementation plan

No application code for this unit.

This unit defines the retake-policy baseline only. Later backend units may implement deterministic eligibility evaluation, policy workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U5-9-exam-retake-policy/unit-state.md`
- `aidlc-docs/construction/units/U5-9-exam-retake-policy/functional-design.md`
- `aidlc-docs/construction/units/U5-9-exam-retake-policy/nfr-requirements.md`
- `aidlc-docs/construction/units/U5-9-exam-retake-policy/nfr-design.md`
- `aidlc-docs/construction/units/U5-9-exam-retake-policy/infrastructure-design.md`
- `aidlc-docs/construction/units/U5-9-exam-retake-policy/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and exam-domain baselines.
- Confirm the unit defines deterministic retake policy clearly.
- Confirm the unit remains separate from history presentation, score calculation, and company-facing visibility workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the retake-policy baseline is rejected or replaced by an approved revision.

## Review checklist

- Deterministic retake-policy flow documented
- Eligibility, validation, and traceability expectations documented
- Relationship to later exam-access, results-summary, and visibility-sensitive units documented
- Separation from history presentation and company-facing visibility logic preserved
- No application code introduced
