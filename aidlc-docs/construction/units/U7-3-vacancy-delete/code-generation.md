# Code generation: U7-3-vacancy-delete

## Implementation plan

No application code for this unit.

This unit defines the vacancy-delete baseline only. Later backend and frontend units may implement protected vacancy removal, validation flows, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U7-3-vacancy-delete/unit-state.md`
- `aidlc-docs/construction/units/U7-3-vacancy-delete/functional-design.md`
- `aidlc-docs/construction/units/U7-3-vacancy-delete/nfr-requirements.md`
- `aidlc-docs/construction/units/U7-3-vacancy-delete/nfr-design.md`
- `aidlc-docs/construction/units/U7-3-vacancy-delete/infrastructure-design.md`
- `aidlc-docs/construction/units/U7-3-vacancy-delete/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and company-domain baselines.
- Confirm the unit defines protected vacancy deletion clearly.
- Confirm the unit remains separate from creation, editing, listing, detail, and requirement-tag workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the vacancy-delete baseline is rejected or replaced by an approved revision.

## Review checklist

- Protected vacancy-delete flow documented
- Company ownership, validation, and inactive-state expectations documented
- Relationship to later vacancy management and requirement-tag units documented
- Separation from listing, detail, and matching logic preserved
- No application code introduced
