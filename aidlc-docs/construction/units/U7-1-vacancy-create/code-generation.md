# Code generation: U7-1-vacancy-create

## Implementation plan

No application code for this unit.

This unit defines the vacancy-creation baseline only. Later backend and frontend units may implement protected vacancy authoring, validation flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U7-1-vacancy-create/unit-state.md`
- `aidlc-docs/construction/units/U7-1-vacancy-create/functional-design.md`
- `aidlc-docs/construction/units/U7-1-vacancy-create/nfr-requirements.md`
- `aidlc-docs/construction/units/U7-1-vacancy-create/nfr-design.md`
- `aidlc-docs/construction/units/U7-1-vacancy-create/infrastructure-design.md`
- `aidlc-docs/construction/units/U7-1-vacancy-create/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and company-domain baselines.
- Confirm the unit defines protected vacancy creation clearly.
- Confirm the unit remains separate from editing, deletion, listing, detail, and requirement-tag workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the vacancy-creation baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected vacancy-creation flow documented
- Company ownership, validation, and draft-visibility expectations documented
- Relationship to later vacancy management and requirement-tag units documented
- Separation from listing, detail, and matching logic preserved
- No application code introduced
