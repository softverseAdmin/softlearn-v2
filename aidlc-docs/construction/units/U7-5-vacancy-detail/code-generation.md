# Code generation: U7-5-vacancy-detail

## Implementation plan

No application code for this unit.

This unit defines the vacancy-detail baseline only. Later backend and frontend units may implement vacancy detail retrieval, visibility-aware detail views, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U7-5-vacancy-detail/unit-state.md`
- `aidlc-docs/construction/units/U7-5-vacancy-detail/functional-design.md`
- `aidlc-docs/construction/units/U7-5-vacancy-detail/nfr-requirements.md`
- `aidlc-docs/construction/units/U7-5-vacancy-detail/nfr-design.md`
- `aidlc-docs/construction/units/U7-5-vacancy-detail/infrastructure-design.md`
- `aidlc-docs/construction/units/U7-5-vacancy-detail/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Confirm the unit defines stable vacancy detail clearly.
- Confirm the unit remains separate from search filters, applications, bookmarks, and matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the vacancy-detail baseline is rejected or replaced by an approved revision.

## Review checklist

- Vacancy-detail flow documented
- Visibility, detail-shape, and unavailable-state expectations documented
- Relationship to later search, application, bookmark, and matching units documented
- Separation from search, applications, and matching logic preserved
- No application code introduced
