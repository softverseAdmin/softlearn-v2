# Code generation: U9-4-language-level-matching

## Implementation plan

No application code for this unit.

This unit defines the language-level-matching baseline only. Later backend units may implement deterministic language-factor evaluation, explanation workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U9-4-language-level-matching/unit-state.md`
- `aidlc-docs/construction/units/U9-4-language-level-matching/functional-design.md`
- `aidlc-docs/construction/units/U9-4-language-level-matching/nfr-requirements.md`
- `aidlc-docs/construction/units/U9-4-language-level-matching/nfr-design.md`
- `aidlc-docs/construction/units/U9-4-language-level-matching/infrastructure-design.md`
- `aidlc-docs/construction/units/U9-4-language-level-matching/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Confirm the unit defines deterministic language-level matching clearly.
- Confirm the unit remains separate from other factors, aggregate scoring, and matched-view workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the language-level-matching baseline is rejected or replaced by an approved revision.

## Review checklist

- Deterministic language-level-matching flow documented
- Explainable language-fit expectations documented
- Relationship to later aggregate scoring and matched-view units documented
- Separation from other factors and aggregate scoring preserved
- No application code introduced
