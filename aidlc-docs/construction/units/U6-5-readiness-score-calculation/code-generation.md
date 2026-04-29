# Code generation: U6-5-readiness-score-calculation

## Implementation plan

No application code for this unit.

This unit defines the readiness-score baseline only. Later backend units may implement deterministic readiness evaluation, explanation workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U6-5-readiness-score-calculation/unit-state.md`
- `aidlc-docs/construction/units/U6-5-readiness-score-calculation/functional-design.md`
- `aidlc-docs/construction/units/U6-5-readiness-score-calculation/nfr-requirements.md`
- `aidlc-docs/construction/units/U6-5-readiness-score-calculation/nfr-design.md`
- `aidlc-docs/construction/units/U6-5-readiness-score-calculation/infrastructure-design.md`
- `aidlc-docs/construction/units/U6-5-readiness-score-calculation/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, privacy, and rule-based matching baselines.
- Confirm the unit defines deterministic readiness-score calculation clearly.
- Confirm the unit remains separate from company-facing visibility rules and full vacancy matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the readiness-score baseline is rejected or replaced by an approved revision.

## Review checklist

- Deterministic readiness-score flow documented
- Explainability, validation, and privacy expectations documented
- Relationship to later matching, guidance, and visibility-sensitive units documented
- Separation from company-facing visibility and full match logic preserved
- No application code introduced
