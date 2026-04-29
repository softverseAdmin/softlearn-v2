# Code generation: U8-6-salary-filter

## Implementation plan

No application code for this unit.

This unit defines the salary-filter baseline only. Later backend and frontend units may implement salary filtering, filter UI behavior, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U8-6-salary-filter/unit-state.md`
- `aidlc-docs/construction/units/U8-6-salary-filter/functional-design.md`
- `aidlc-docs/construction/units/U8-6-salary-filter/nfr-requirements.md`
- `aidlc-docs/construction/units/U8-6-salary-filter/nfr-design.md`
- `aidlc-docs/construction/units/U8-6-salary-filter/infrastructure-design.md`
- `aidlc-docs/construction/units/U8-6-salary-filter/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Confirm the unit defines salary filtering clearly.
- Confirm the unit remains separate from other filters, bookmarks, applications, and matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the salary-filter baseline is rejected or replaced by an approved revision.

## Review checklist

- Salary-filter flow documented
- Salary-filter and visible-result expectations documented
- Relationship to later bookmarks, applications, and matching units documented
- Separation from other filters and matching logic preserved
- No application code introduced
