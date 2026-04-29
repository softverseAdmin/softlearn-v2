# Code generation: U9-3-exam-score-matching

## Implementation plan

No application code for this unit.

This unit defines the exam-score-matching baseline only. Later backend units may implement deterministic exam-factor evaluation, explanation workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U9-3-exam-score-matching/unit-state.md`
- `aidlc-docs/construction/units/U9-3-exam-score-matching/functional-design.md`
- `aidlc-docs/construction/units/U9-3-exam-score-matching/nfr-requirements.md`
- `aidlc-docs/construction/units/U9-3-exam-score-matching/nfr-design.md`
- `aidlc-docs/construction/units/U9-3-exam-score-matching/infrastructure-design.md`
- `aidlc-docs/construction/units/U9-3-exam-score-matching/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Confirm the unit defines deterministic exam-score matching clearly.
- Confirm the unit remains separate from other factors, aggregate scoring, and matched-view workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the exam-score-matching baseline is rejected or replaced by an approved revision.

## Review checklist

- Deterministic exam-score-matching flow documented
- Explainable exam-fit expectations documented
- Relationship to later aggregate scoring and matched-view units documented
- Separation from other factors and aggregate scoring preserved
- No application code introduced
