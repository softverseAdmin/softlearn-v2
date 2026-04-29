# Code generation: U7-4-vacancy-list

## Implementation plan

No application code for this unit.

This unit defines the vacancy-list baseline only. Later backend and frontend units may implement vacancy summary retrieval, visibility-aware list views, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U7-4-vacancy-list/unit-state.md`
- `aidlc-docs/construction/units/U7-4-vacancy-list/functional-design.md`
- `aidlc-docs/construction/units/U7-4-vacancy-list/nfr-requirements.md`
- `aidlc-docs/construction/units/U7-4-vacancy-list/nfr-design.md`
- `aidlc-docs/construction/units/U7-4-vacancy-list/infrastructure-design.md`
- `aidlc-docs/construction/units/U7-4-vacancy-list/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Confirm the unit defines stable vacancy listing clearly.
- Confirm the unit remains separate from vacancy detail, search filters, applications, and matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the vacancy-list baseline is rejected or replaced by an approved revision.

## Review checklist

- Vacancy-list flow documented
- Visibility, ordering, and summary expectations documented
- Relationship to later detail, search, application, and matching units documented
- Separation from detail, filters, and matching logic preserved
- No application code introduced
