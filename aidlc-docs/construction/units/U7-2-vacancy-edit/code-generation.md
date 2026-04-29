# Code generation: U7-2-vacancy-edit

## Implementation plan

No application code for this unit.

This unit defines the vacancy-edit baseline only. Later backend and frontend units may implement protected vacancy updates, validation flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U7-2-vacancy-edit/unit-state.md`
- `aidlc-docs/construction/units/U7-2-vacancy-edit/functional-design.md`
- `aidlc-docs/construction/units/U7-2-vacancy-edit/nfr-requirements.md`
- `aidlc-docs/construction/units/U7-2-vacancy-edit/nfr-design.md`
- `aidlc-docs/construction/units/U7-2-vacancy-edit/infrastructure-design.md`
- `aidlc-docs/construction/units/U7-2-vacancy-edit/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and company-domain baselines.
- Confirm the unit defines protected vacancy editing clearly.
- Confirm the unit remains separate from creation, deletion, listing, detail, and requirement-tag workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the vacancy-edit baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected vacancy-edit flow documented
- Company ownership, validation, and visibility-control expectations documented
- Relationship to later vacancy management and requirement-tag units documented
- Separation from deletion, listing, detail, and matching logic preserved
- No application code introduced
