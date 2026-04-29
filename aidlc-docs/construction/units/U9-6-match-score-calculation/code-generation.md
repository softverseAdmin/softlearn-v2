# Code generation: U9-6-match-score-calculation

## Implementation plan

No application code for this unit.

This unit defines the aggregate match-score baseline only. Later backend units may implement deterministic factor aggregation, ranking workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U9-6-match-score-calculation/unit-state.md`
- `aidlc-docs/construction/units/U9-6-match-score-calculation/functional-design.md`
- `aidlc-docs/construction/units/U9-6-match-score-calculation/nfr-requirements.md`
- `aidlc-docs/construction/units/U9-6-match-score-calculation/nfr-design.md`
- `aidlc-docs/construction/units/U9-6-match-score-calculation/infrastructure-design.md`
- `aidlc-docs/construction/units/U9-6-match-score-calculation/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Confirm the unit defines deterministic aggregate match scoring clearly.
- Confirm the unit remains separate from matched-list presentation and application workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the aggregate match-score baseline is rejected or replaced by an approved revision.

## Review checklist

- Deterministic aggregate match-score flow documented
- Weighting, classification, and explanation expectations documented
- Relationship to later matched-view units documented
- Separation from matched-list presentation preserved
- No application code introduced
