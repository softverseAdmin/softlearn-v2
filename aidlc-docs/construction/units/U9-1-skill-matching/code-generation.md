# Code generation: U9-1-skill-matching

## Implementation plan

No application code for this unit.

This unit defines the skill-matching baseline only. Later backend units may implement deterministic skill-factor evaluation, explanation workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U9-1-skill-matching/unit-state.md`
- `aidlc-docs/construction/units/U9-1-skill-matching/functional-design.md`
- `aidlc-docs/construction/units/U9-1-skill-matching/nfr-requirements.md`
- `aidlc-docs/construction/units/U9-1-skill-matching/nfr-design.md`
- `aidlc-docs/construction/units/U9-1-skill-matching/infrastructure-design.md`
- `aidlc-docs/construction/units/U9-1-skill-matching/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Confirm the unit defines deterministic skill matching clearly.
- Confirm the unit remains separate from other factors, aggregate scoring, and matched-view workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the skill-matching baseline is rejected or replaced by an approved revision.

## Review checklist

- Deterministic skill-matching flow documented
- Explainable matched-skill and missing-skill expectations documented
- Relationship to later aggregate scoring and matched-view units documented
- Separation from other factors and aggregate scoring preserved
- No application code introduced
