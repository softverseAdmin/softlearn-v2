# Code generation: U8-2-job-search-bar

## Implementation plan

No application code for this unit.

This unit defines the job-search-bar baseline only. Later backend and frontend units may implement student job query behavior, search-bar rendering, and tests from this design.

## Files to create or update

- `aidlc-docs/construction/units/U8-2-job-search-bar/unit-state.md`
- `aidlc-docs/construction/units/U8-2-job-search-bar/functional-design.md`
- `aidlc-docs/construction/units/U8-2-job-search-bar/nfr-requirements.md`
- `aidlc-docs/construction/units/U8-2-job-search-bar/nfr-design.md`
- `aidlc-docs/construction/units/U8-2-job-search-bar/infrastructure-design.md`
- `aidlc-docs/construction/units/U8-2-job-search-bar/code-generation.md`
- `aidlc-docs/aidlc-state.md`

## Test plan

- Review the unit against the requirements, security, data-model, architecture, and vacancy-visibility baselines.
- Confirm the unit defines the job search bar clearly.
- Confirm the unit remains separate from structured filters, bookmarks, applications, and matching workflows.
- Confirm no application code is added.
- Run `./scripts/aidlc-check.sh`.

## Rollback plan

Revert the documentation-only change if the job-search-bar baseline is rejected or replaced by an approved revision.

## Review checklist

- Job-search-bar flow documented
- Query-state and visible-result expectations documented
- Relationship to later filters, bookmarks, applications, and matching units documented
- Separation from structured filters and matching logic preserved
- No application code introduced
