# Code generation: U9-2-course-completion-matching

## Implementation plan

No application code for this unit.

This unit defines the course-completion-matching baseline only. Later backend units may implement deterministic learning-factor evaluation, explanation workflows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U9-2-course-completion-matching/unit-state.md`
- `aidlc-docs/construction/units/U9-2-course-completion-matching/functional-design.md`
- `aidlc-docs/construction/units/U9-2-course-completion-matching/nfr-requirements.md`
- `aidlc-docs/construction/units/U9-2-course-completion-matching/nfr-design.md`
- `aidlc-docs/construction/units/U9-2-course-completion-matching/infrastructure-design.md`
- `aidlc-docs/construction/units/U9-2-course-completion-matching/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and rule-based matching baselines.
- Confirm the unit defines deterministic course-completion matching clearly.
- Confirm the unit remains separate from other factors, aggregate scoring, and matched-view workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the course-completion-matching baseline is rejected or replaced by an approved revision.

## Review checklist

- Deterministic course-completion-matching flow documented
- Explainable learning-fit expectations documented
- Relationship to later aggregate scoring and matched-view units documented
- Separation from other factors and aggregate scoring preserved
- No application code introduced
