# Code generation: U9-5-location-preference-matching

## Implementation plan

No application code for this unit.

This unit defines the location-preference-matching baseline only. Later backend units may implement deterministic location-factor evaluation, explanation workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U9-5-location-preference-matching/unit-state.md`
- `aidlc-docs/construction/units/U9-5-location-preference-matching/functional-design.md`
- `aidlc-docs/construction/units/U9-5-location-preference-matching/nfr-requirements.md`
- `aidlc-docs/construction/units/U9-5-location-preference-matching/nfr-design.md`
- `aidlc-docs/construction/units/U9-5-location-preference-matching/infrastructure-design.md`
- `aidlc-docs/construction/units/U9-5-location-preference-matching/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Confirm the unit defines deterministic location-preference matching clearly.
- Confirm the unit remains separate from other factors, aggregate scoring, and matched-view workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the location-preference-matching baseline is rejected or replaced by an approved revision.

## Review checklist

- Deterministic location-preference-matching flow documented
- Explainable location-fit expectations documented
- Relationship to later aggregate scoring and matched-view units documented
- Separation from other factors and aggregate scoring preserved
- No application code introduced
